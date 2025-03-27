const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="container mx-auto w-[1200px] grid grid-cols-12 gap-4 py-10">
        {/* Logo - Chiếm 4 cột */}
        <div className="col-span-4 flex items-center justify-center">
          <h2 className="text-3xl text-white font-bold">KONEX</h2>
        </div>

        {/* Nội dung chính - Chiếm 8 cột */}
        <div className="col-span-8 p-12">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[960px] mt-8 text-sm text-gray-500 flex justify-center">
        <p>© 2025 Facebook. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;