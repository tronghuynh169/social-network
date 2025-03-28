import SideBar from "../SideBar";

function DefaultLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <div className="w-1/6 border-r border-[#262626] border-opacity-10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]">
                <SideBar />
            </div>

            <div className="w-5/6 px-4 max-w-[1200px] mx-auto flex-grow">
                {children}
            </div>
        </div>
    );
}

export default DefaultLayout;
