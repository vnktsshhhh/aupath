import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Briefcase } from "lucide-react";

export const metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { jobs: { where: { isActive: true } } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-500 mt-1">
          Explore {companies.length} Australian employers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c) => (
          <Link key={c.id} href={`/companies/${c.slug}`} className="group">
            <Card className="h-full hover:border-teal-300 hover:shadow-md transition-all duration-200">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {c.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Building2 size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-navy-700 transition-colors truncate">
                      {c.name}
                    </h3>
                    {c.industry && (
                      <p className="text-xs text-gray-500">{c.industry}</p>
                    )}
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.location && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <MapPin size={10} /> {c.location}
                      </span>
                    )}
                    {c.size && (
                      <span className="text-xs text-gray-400">{c.size}</span>
                    )}
                  </div>
                  <Badge variant={c._count.jobs > 0 ? "teal" : "default"}>
                    <Briefcase size={10} className="mr-1" />
                    {c._count.jobs} {c._count.jobs === 1 ? "job" : "jobs"}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
