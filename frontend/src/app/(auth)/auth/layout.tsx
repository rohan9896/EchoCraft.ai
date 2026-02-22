import React from 'react'
import { Mic, Sparkles, Zap, Shield, Globe } from 'lucide-react'
import { SoundWave } from '~/components/ui/sound-wave'
import { Providers } from '~/components/providers'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout = (props: AuthLayoutProps) => {
  const { children } = props

  return (
    <Providers>
      <AuthPageLayout>
        {children}
      </AuthPageLayout>
    </Providers>
  )
}

const AuthPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding Section */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand via-brand-light to-brand-lighter">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large circles for depth */}
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 -right-32 w-[450px] h-[450px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-[350px] h-[350px] bg-white/15 rounded-full blur-3xl" />
          
          {/* Sound wave pattern at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-15 text-white">
            <SoundWave className="animate-pulse" />
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-24 left-16 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-48 right-24 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
          <div className="absolute top-72 left-1/3 w-2 h-2 bg-white/35 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute bottom-48 right-1/3 w-3 h-3 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-center w-full px-12 xl:px-16 2xl:px-24 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
              <Mic className="w-6 h-6 text-brand" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">EchoCraft.ai</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight mb-4">
            Transform Your Voice
            <br />
            <span className="text-white/90">Into Intelligence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base xl:text-lg text-white/80 mb-10 max-w-lg leading-relaxed">
            Create stunning voice experiences with AI-powered synthesis, recognition, and transformation. 
            The future of voice technology is here.
          </p>

          {/* Features */}
          <div className="grid gap-4 mb-10">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm xl:text-base">Real-time Processing</h3>
                <p className="text-white/70 text-xs xl:text-sm">Lightning-fast voice synthesis & recognition</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm xl:text-base">AI-Powered Voices</h3>
                <p className="text-white/70 text-xs xl:text-sm">Natural, expressive voice generation</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm xl:text-base">Enterprise Security</h3>
                <p className="text-white/70 text-xs xl:text-sm">Bank-grade encryption for your data</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm xl:text-base">50+ Languages</h3>
                <p className="text-white/70 text-xs xl:text-sm">Global voice solutions for everyone</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="pt-6 border-t border-white/20">
            <p className="text-white/60 text-xs mb-2">Trusted by innovative teams worldwide</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center text-[10px] text-white font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-white/80 text-xs font-medium">10,000+ users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
