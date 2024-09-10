import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AuthContext } from '@/modules/auth_provider'
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Github, Twitter, Loader2 } from 'lucide-react'
import Link from 'next/link'

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await signup(username, email, password);
      toast({
        title: "Sign Up Successful",
        description: "Welcome! Your account has been created.",
      });
      router.push('/chat');
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md bg-slate-800/80 backdrop-blur-md text-slate-100 border-purple-500 shadow-lg shadow-purple-500/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-purple-400">
              Create an Account
            </CardTitle>
            <CardDescription className="text-slate-400 text-center">Enter your details to sign up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              className="space-y-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Label htmlFor="name" className="text-slate-200">Name</Label>
              <Input id="name" type="text" placeholder="John Doe" 
                className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/50" />
            </motion.div>
            <motion.div 
              className="space-y-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/50" />
            </motion.div>
            <motion.div 
              className="space-y-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/50" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white relative overflow-hidden group" onClick={handleSignUp}>
                <AnimatePresence>
                  {isLoading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="signup"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      Sign Up
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform -skew-x-12"></span>
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-slate-400">Already have an account? </span>
              <Link href="/login" className="text-purple-400 hover:underline">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUpPage;