import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';

interface EmailSignatureProps {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  nmls: string;
  companyNmls: string;
  photoUrl?: string;
}

export function EmailSignature({
  name,
  title,
  email,
  phone,
  address,
  nmls,
  companyNmls,
  photoUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
}: EmailSignatureProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex gap-4">
        <img
          src={photoUrl}
          alt={name}
          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
        />
        <div className="space-y-1">
          <h4 className="text-base font-bold text-cmg-teal">{name}</h4>
          <p className="text-sm text-gray-600">{title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3 h-3" />
            <a href={`mailto:${email}`} className="text-cmg-teal hover:underline">
              {email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="w-3 h-3" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{address}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <a href="#" className="text-cmg-teal font-medium hover:underline uppercase">
          Apply Now
        </a>
        <span className="text-gray-300">|</span>
        <a href="#" className="text-cmg-teal font-medium hover:underline uppercase">
          MySite
        </a>
        <span className="text-gray-300">|</span>
        <a href="#" className="text-cmg-teal font-medium hover:underline uppercase">
          Doc Upload
        </a>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <a href="#" className="text-gray-400 hover:text-cmg-teal transition-colors">
          <Linkedin className="w-4 h-4" />
        </a>
        <a href="#" className="text-gray-400 hover:text-cmg-teal transition-colors">
          <Facebook className="w-4 h-4" />
        </a>
        <a href="#" className="text-gray-400 hover:text-cmg-teal transition-colors">
          <Instagram className="w-4 h-4" />
        </a>
        <a href="#" className="text-gray-400 hover:text-cmg-teal transition-colors">
          <Twitter className="w-4 h-4" />
        </a>
      </div>

      <p className="mt-3 text-2xs text-gray-500">
        NMLS# {nmls} | CMG Financial NMLS# {companyNmls}
      </p>
    </div>
  );
}
