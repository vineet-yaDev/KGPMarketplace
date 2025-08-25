'use client'

import React from 'react'
import { Calculator, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Product categories enum (make sure this matches your types)
enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  BOOKS = 'BOOKS',
  STATIONERY = 'STATIONERY', 
  FURNITURE = 'FURNITURE',
  HOUSEHOLD = 'HOUSEHOLD',
  SPORTS = 'SPORTS',
  CYCLE = 'CYCLE',
  APPAREL = 'APPAREL',
  TICKETS = 'TICKETS',
  OTHER = 'OTHER'
}

// Depreciation models for different categories
const DEPRECIATION_MODELS: Record<string, number[]> = {
  [ProductCategory.ELECTRONICS]: [0.70, 0.85, 0.90], // Year 1: 30% drop, Year 2: 15%, then 10% yearly
  [ProductCategory.CYCLE]: [0.80, 0.90, 0.95],        // Year 1: 20% drop, Year 2: 10%, then 5% yearly
  [ProductCategory.FURNITURE]: [0.85, 0.90, 0.95],    // Year 1: 15% drop, Year 2: 10%, then 5% yearly
  [ProductCategory.HOUSEHOLD]: [0.85, 0.90, 0.95],    // Similar to furniture/appliances
  [ProductCategory.SPORTS]: [0.75, 0.88, 0.93],       // Year 1: 25% drop, Year 2: 12%, then 7% yearly
  [ProductCategory.BOOKS]: [0.60, 0.80, 0.90],        // Year 1: 40% drop, Year 2: 20%, then 10% yearly
  [ProductCategory.STATIONERY]: [0.50, 0.75, 0.85],   // Year 1: 50% drop, Year 2: 25%, then 15% yearly
  [ProductCategory.APPAREL]: [0.50, 0.70, 0.80],      // Year 1: 50% drop, Year 2: 30%, then 20% yearly
  [ProductCategory.TICKETS]: [0.90, 0.95, 0.98],      // Minimal depreciation for tickets/vouchers
  [ProductCategory.OTHER]: [0.75, 0.85, 0.92]         // Default moderate depreciation
}

// Condition factors mapping condition values (1-5) to multipliers
const CONDITION_FACTORS: Record<number, number> = {
  5: 1.0,    // Excellent/New condition
  4: 0.9,    // Good condition
  3: 0.75,   // Decent condition
  2: 0.6,    // Average condition
  1: 0.4     // Poor condition
}

// Condition labels for display
const CONDITION_LABELS: Record<number, string> = {
  5: 'Excellent/New',
  4: 'Good',
  3: 'Decent', 
  2: 'Average',
  1: 'Poor'
}

interface SmartPriceCalculatorProps {
  originalPrice: string
  ageInMonths: string
  category: string
  condition: string
  onPriceCalculated: (price: string) => void
  onValidationErrors: (errors: string[]) => void
}

// Helper function to get depreciation rates for a category
const getDepreciationRates = (category: string): number[] => {
  return DEPRECIATION_MODELS[category] || DEPRECIATION_MODELS[ProductCategory.OTHER]
}

// Helper function to get condition factor
const getConditionFactor = (condition: number): number => {
  return CONDITION_FACTORS[condition] || 0.9
}

// Main calculation function
const calculateResalePrice = (
  originalPrice: number,
  ageInYears: number,
  category: string,
  condition: number
): number => {
  const conditionFactor = getConditionFactor(condition)
  
  if (ageInYears <= 0) {
    return Math.round(originalPrice * conditionFactor)
  }
  
  const depreciationFactors = getDepreciationRates(category)
  let resaleValue: number
  
  if (ageInYears <= 1) {
    // Linear interpolation for partial first year
    const firstYearFactor = depreciationFactors[0]
    const depreciationAmount = (1 - firstYearFactor) * ageInYears
    resaleValue = originalPrice * (1 - depreciationAmount)
  } else if (ageInYears <= 2) {
    // First year + partial second year
    const remainingYears = ageInYears - 1
    const secondYearDepreciation = (1 - depreciationFactors[1]) * remainingYears
    resaleValue = originalPrice * depreciationFactors[0] * (1 - secondYearDepreciation)
  } else {
    // First year + second year + subsequent years
    const subsequentYears = ageInYears - 2
    resaleValue = originalPrice * 
      depreciationFactors[0] * 
      depreciationFactors[1] * 
      (depreciationFactors[2] ** subsequentYears)
  }
  
  return Math.round(resaleValue * conditionFactor)
}

// Validation function
const validateInputs = (
  originalPrice: string,
  ageInMonths: string,
  category: string,
  condition: string
): string[] => {
  const errors: string[] = []
  
  if (!originalPrice || originalPrice.trim() === '' || parseFloat(originalPrice) <= 0) {
    errors.push('Original Price is required and must be greater than 0')
  }
  
  if (!ageInMonths || ageInMonths.trim() === '' || parseFloat(ageInMonths) < 0) {
    errors.push('Age in Months is required and cannot be negative')
  }
  
  if (!category || category.trim() === '') {
    errors.push('Category is required for price calculation')
  }
  
  if (!condition || condition.trim() === '') {
    errors.push('Condition is required for price calculation')
  }
  
  return errors
}

export const SmartPriceCalculator: React.FC<SmartPriceCalculatorProps> = ({
  originalPrice,
  ageInMonths,
  category,
  condition,
  onPriceCalculated,
  onValidationErrors
}) => {
  const [isCalculating, setIsCalculating] = React.useState(false)
  const [lastCalculation, setLastCalculation] = React.useState<{
    price: number
    details: string
  } | null>(null)

  const handleCalculate = () => {
    setIsCalculating(true)
    
    // Validate inputs
    const errors = validateInputs(originalPrice, ageInMonths, category, condition)
    
    if (errors.length > 0) {
      onValidationErrors(errors)
      setIsCalculating(false)
      return
    }
    
    try {
      const price = parseFloat(originalPrice)
      const months = parseFloat(ageInMonths)
      const years = months / 12
      const conditionValue = parseInt(condition)
      
      const calculatedPrice = calculateResalePrice(price, years, category, conditionValue)
      
      // Create calculation details
      const conditionLabel = CONDITION_LABELS[conditionValue] || 'Unknown'
      const conditionFactor = getConditionFactor(conditionValue)
      
      const details = `Based on: ₹${price.toLocaleString()} original price, ${months} months old (${years.toFixed(1)} years), ${category.toLowerCase()} category, ${conditionLabel.toLowerCase()} condition (${(conditionFactor * 100).toFixed(0)}% factor)`
      
      setLastCalculation({
        price: calculatedPrice,
        details
      })
      
      // Call the parent callback with the calculated price
      onPriceCalculated(calculatedPrice.toString())
      onValidationErrors([]) // Clear any previous errors
      
    } catch (error) {
      console.error('Price calculation error:', error)
      onValidationErrors(['An error occurred during price calculation. Please check your inputs.'])
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          type="button"
          onClick={handleCalculate}
          disabled={isCalculating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
        >
          <Calculator className="w-4 h-4" />
          <span>
            {isCalculating ? 'Calculating...' : 'Calculate Smart Price'}
          </span>
        </Button>
        
        <div className="text-xs text-muted-foreground max-w-md">
          Automatically calculates fair market price based on original price, age, category, and condition
        </div>
      </div>

      {lastCalculation && (
        <Alert className="border border-green-200 bg-green-50/10 dark:bg-green-950/20 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="font-semibold mb-1">
              Calculated Price: ₹{lastCalculation.price.toLocaleString()}
            </div>
            <div className="text-xs opacity-90">
              {lastCalculation.details}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default SmartPriceCalculator