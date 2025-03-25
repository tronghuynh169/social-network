const AuthLayout = ({ children }) => {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Nội dung chính (Form Login/Signup) */}
        <main className="flex flex-1 justify-center items-center bg-gray-100">
          {children}
        </main>
  
        {/* Footer */}
        <footer className="py-4 bg-white text-center text-sm text-gray-500 border-t">
          <p>© 2025 Facebook. All rights reserved.</p>
        </footer>
      </div>
    );
  };
  
  export default AuthLayout;