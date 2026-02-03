'use client'

import { Github, Instagram, Linkedin, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '@/components/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AboutUsPage() {
  const teamMembers = [
    {
      name: "Vineet Yadav",
      role: "Co-Founder & CTO",
      image: "/vineet.jpg",
      bio: "Curious by nature, I co-founded my current venture to solve real problems through intuitive digital products. As a full stack developer, I focus on building reliable, scalable solutions with React, Node.js, TypeScript, and NextJS. I enjoy turning complex challenges into user-friendly experiences and always look for ways to learn and collaborate along the way.",
      skills: ["NextJS", "PostgreSQL", "TypeScript", "Tailwind"],
      social: {
        github: "https://github.com/vineet-yadev",
        instagram: "https://instagram.com/vineet_yadav4169",
        linkedin: "https://www.linkedin.com/in/vineet-yadav-a60260228/",
        email: "vineetyadavofficial@gmail.com"
      },
      gradient: "from-violet-600 via-purple-600 to-blue-600"
    },
    {
      name: "Sudeep Bhurat",
      role: "Co-Founder & CEO",
      image: "/sudeep.png",
      bio: "Co-Founder and Product Manager passionate about making things easier and more enjoyable for people. Focused on turning ideas into practical solutions, Sudeep collaborates closely with teams to ensure every product feels simple and approachable for users.",
      skills: ["Figma", "Design Systems", "User Researchs", "Prototyping"],
      social: {
        github: "https://github.com/vineet-yadev",
        instagram: "https://instagram.com/sudeepbhurat",
        linkedin: "https://linkedin.com/in/sudeep-bhurat",
        email: "sudeepbhurat@gmail.com"
      },
      gradient: "from-pink-600 via-rose-600 to-orange-600"
    }
  ]

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          
          <div className="container mx-auto px-4 py-24 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-white/20 backdrop-blur-sm mb-8">
                <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Meet The Team
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  About Us
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                We&apos;re the passionate minds behind KGP Marketplace, dedicated to connecting the 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"> IIT Kharagpur community </span>
                through innovation and design.
              </p>
            </div>
          </div>
        </section>

        {/* Team Cards Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {teamMembers.map((member) => (
                <Card 
                  key={member.name} 
                  className="group relative overflow-hidden bg-white/10 dark:bg-white/5 border-white/20 backdrop-blur-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
                  
                  <CardContent className="p-0 relative z-10">
                    {/* Image Section */}
                    <div className="relative overflow-hidden">
                      <div className="aspect-[4/3] relative">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${member.gradient} flex items-center justify-center relative`}>
                            <div className="absolute inset-0 bg-black/20" />
                            <span className="text-white text-8xl font-bold relative z-10">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                      
                      {/* Floating Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className={`bg-gradient-to-r ${member.gradient} text-white border-0 px-3 py-1 font-semibold shadow-lg`}>
                          Co-Founder
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {member.name}
                        </h2>
                        <p className={`text-lg font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent`}>
                          {member.role}
                        </p>
                      </div>

                      <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                        {member.bio}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 justify-center mb-8">
                        {member.skills.map((skill, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="bg-white/20 dark:bg-white/10 text-foreground border border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center space-x-4">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="rounded-full p-3 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 group/btn transition-all duration-300 hover:scale-110"
                        >
                          <a href={member.social.github} target="_blank" rel="noopener noreferrer">
                            <Github className="w-5 h-5 text-foreground group-hover/btn:text-purple-600 transition-colors" />
                          </a>
                        </Button>

                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="rounded-full p-3 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 group/btn transition-all duration-300 hover:scale-110"
                        >
                          <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-5 h-5 text-foreground group-hover/btn:text-blue-600 transition-colors" />
                          </a>
                        </Button>

                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="rounded-full p-3 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 group/btn transition-all duration-300 hover:scale-110"
                        >
                          <a href={member.social.instagram} target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-5 h-5 text-foreground group-hover/btn:text-sky-500 transition-colors" />
                          </a>
                        </Button>

                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="rounded-full p-3 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 group/btn transition-all duration-300 hover:scale-110"
                        >
                          <a href={`mailto:${member.social.email}`}>
                            <Mail className="w-5 h-5 text-foreground group-hover/btn:text-green-600 transition-colors" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-white/10 dark:bg-white/5 border-white/20 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10" />
              
              <CardContent className="p-12 relative z-10 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-white/20 backdrop-blur-sm mb-8">
                  <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                    Our Mission
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Building Connections That Matter
                  </span>
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  We&apos;re dedicated to creating a platform that brings the IIT Kharagpur community together. 
                  Our mission is to make trading, sharing, and connecting as seamless and trustworthy as possible, 
                  while fostering relationships that last beyond graduation.
                </p>

                <Button 
                  asChild
                  className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                >
                  <Link href="/" className="inline-flex items-center">
                    Explore Marketplace
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
