// components/seo/structured-data.tsx
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';

interface StructuredDataProps {
  data?: any;
  includeDefaults?: boolean;
}

export function StructuredData({ data, includeDefaults = true }: StructuredDataProps) {
  const schemas = [];
  
  if (includeDefaults) {
    schemas.push(generateOrganizationSchema());
    schemas.push(generateWebsiteSchema());
  }
  
  if (data) {
    if (Array.isArray(data)) {
      schemas.push(...data);
    } else {
      schemas.push(data);
    }
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  );
}