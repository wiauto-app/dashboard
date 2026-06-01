import loginImage from "@/assets/login-image.webp";
import { BrandIcon } from "@/assets/brandIcon";
import { Card } from "@/components/ui/card";

type AuthRecoveryLayoutProps = {
  title: string;
  description: string;
  hero_text?: string;
  children: React.ReactNode;
};

export const AuthRecoveryLayout = ({
  title,
  description,
  hero_text = "Recupera el acceso a tu cuenta de administración",
  children,
}: AuthRecoveryLayoutProps) => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-4 sm:p-6">
      <Card className="w-full max-w-5xl overflow-hidden border py-0 shadow-lg">
        <div className="grid min-h-[min(720px,90vh)] md:grid-cols-2">
          <section
            aria-hidden="true"
            className="relative min-h-56 overflow-hidden md:min-h-0"
          >
            <img
              src={loginImage}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative flex h-full flex-col items-center justify-center gap-6 px-8 py-12 text-center">
              <BrandIcon width={200} className="drop-shadow-sm" />
              <p className="max-w-xs text-lg font-semibold leading-snug text-white">
                {hero_text}
              </p>
            </div>
          </section>

          <section className="flex flex-col justify-center bg-card px-8 py-10 sm:px-12 sm:py-14">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {description}
              </p>
              {children}
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
};
