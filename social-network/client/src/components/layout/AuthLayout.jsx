const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {/* Nội dung chính (Login hoặc Register) */}
      <main className="w-full max-w-[960px] p-6 rounded-lg">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[960px] mt-8 text-sm text-gray-500">
        <p>© 2025 Facebook. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;