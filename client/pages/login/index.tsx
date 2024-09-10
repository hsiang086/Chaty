import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Github, Twitter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { AuthContext } from '@/modules/auth_provider'
import { useToast } from "@/components/ui/use-toast"


const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/chat');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-400 text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              className="space-y-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/50" 
              />
            </motion.div>
            <motion.div 
              className="space-y-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/50" 
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-2"
            >
              <Checkbox id="remember" className="border-slate-500 text-purple-500" />
              <label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">Remember me</label>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white relative overflow-hidden group" onClick={handleLogin} disabled={isLoading}>
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
                      key="login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      Log in
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
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
              </div>
            </motion.div>
            <motion.div
              className="flex space-x-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button variant="outline" className="w-full bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600 group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  <Github className="mr-2 h-4 w-4" /> Github
                </span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-gray-600 to-gray-800 opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform -skew-x-12"></span>
              </Button>
              <Button variant="outline" className="w-full bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600 group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  <Twitter className="mr-2 h-4 w-4" /> Twitter
                </span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform -skew-x-12"></span>
              </Button>
            </motion.div>
            <div className="text-center text-sm">
              <span className="text-slate-400">Don't have an account? </span>
              <Link href="/signup" className="text-purple-400 hover:underline">Sign up</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;