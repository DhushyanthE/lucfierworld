
import { Link } from "react-router-dom";
import { Logo } from "../Logo";
import { LogoIconType } from "../Logo";

interface NavLogoProps {
  logoType: LogoIconType;
  onLogoClick: () => void;
}

export const NavLogo = ({ logoType, onLogoClick }: NavLogoProps) => {
  return (
    <Link to="/" className="flex items-center" onClick={onLogoClick}>
      <Logo iconType={logoType} />
      <span className="text-white font-bold ml-2 text-xl">Quantum</span>
    </Link>
  );
};
