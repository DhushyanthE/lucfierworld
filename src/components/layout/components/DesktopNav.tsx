
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  navItems: Array<{
    path: string;
    label: string;
    icon: JSX.Element;
  }>;
  isActive: (path: string) => boolean;
}

export const DesktopNav = ({ navItems, isActive }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-2 ml-4">
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button
            variant={isActive(item.path) ? "default" : "ghost"}
            className={`flex items-center ${
              isActive(item.path)
                ? 'bg-purple-600 text-white hover:bg-purple-700 hover:text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Button>
        </Link>
      ))}
    </nav>
  );
};
