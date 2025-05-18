export default function HowItWorks() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How DevCred Works</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Turn your coding expertise into valuable digital assets in just a few simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-lightBg dark:bg-darkBg rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 relative">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-plug text-primary text-xl"></i>
            </div>
            <span className="absolute top-6 right-6 text-4xl font-display font-bold text-gray-200 dark:text-gray-800">1</span>
            <h3 className="text-xl font-display font-bold mb-3">Connect</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your GitHub account and wallet to start building your on-chain development identity.
            </p>
          </div>
          
          <div className="bg-lightBg dark:bg-darkBg rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 relative">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-code-branch text-secondary text-xl"></i>
            </div>
            <span className="absolute top-6 right-6 text-4xl font-display font-bold text-gray-200 dark:text-gray-800">2</span>
            <h3 className="text-xl font-display font-bold mb-3">Create</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your GitHub contributions are analyzed and transformed into unique NFTs on Lens Chain.
            </p>
          </div>
          
          <div className="bg-lightBg dark:bg-darkBg rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 relative">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-trophy text-accent text-xl"></i>
            </div>
            <span className="absolute top-6 right-6 text-4xl font-display font-bold text-gray-200 dark:text-gray-800">3</span>
            <h3 className="text-xl font-display font-bold mb-3">Showcase</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Display your developer achievements and build reputation in the developer ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
