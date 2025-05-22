import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Code, Home, ArrowLeft, Search, Github } from "lucide-react";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - DevCred</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>
      
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen flex items-center">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Code className="h-12 w-12 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
              404
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Page Not Found
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              The page you're looking for doesn't exist or may have been moved.
              Check the URL or navigate back to one of our main pages.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.history.back()}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              
              <Link href="/repositories">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Github className="h-4 w-4" />
                  Repositories
                </Button>
              </Link>
              
              <Link href="/explore">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
