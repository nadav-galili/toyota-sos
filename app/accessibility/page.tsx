'use client';

import Link from 'next/link';
import { ArrowRight, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background relative overflow-hidden font-sans py-12 px-4">
      <style>{`
        @keyframes appear {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-appear {
          animation: appear 0.5s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center text-right space-y-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 animate-appear opacity-0">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              חזרה למסך הבית
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            Toyota S.O.S
            <Accessibility className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border shadow-sm w-full space-y-6 animate-appear opacity-0 [animation-delay:200ms]">
          <h1 className="text-3xl font-bold text-foreground border-b pb-4">
            הצהרת נגישות - Toyota S.O.S
          </h1>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-xl font-bold text-foreground pt-4">
              האתר הונגש באופן הבא:
            </h2>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>התאמת האתר לכל סוגי הדפדפנים המודרניים.</li>
              <li>
                התאמת האתר לכל סוגי הפלטפורמות – מובייל, טבלטים ודסקטופים.
              </li>
              <li>התאמת האתר מבחינת שימוש במקלדת בלבד.</li>
              <li>התאמת האתר לאנשים עם לקות ראיה חלקית או מלאה.</li>
              <li>
                התאמת האתר והתכנים באתר לאנשים עם לקות שמיעתית חלקית או מלאה.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground pt-4">
              פעולות שבוצעו להנגשת האתר:
            </h2>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>
                שינויים ובדיקות באתר על מנת שיתאים לכל הדפדפנים ולכל הפלטפורמות
                (ריספונסיביות).
              </li>
              <li>
                בדיקת ניגודיות בצבעים, הוספת טקסט הסבר לתמונות, והוספת תוויות
                (labels) בטפסים השונים.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground pt-4">
              הכלים בהם השתמשנו לבדיקת הנגישות:
            </h2>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>תקן הנגישות כפי שמפורט באתר ה-W3C.</li>
              <li>קריטריוני הבדיקה של אתר הנגישות הישראלי.</li>
              <li>סריקה ידנית של קוד המקור של המערכת.</li>
              <li>שימוש בכלים חצי אוטומטיים כמו Google Lighthouse.</li>
            </ul>

            <div className="pt-6 border-t mt-8">
              <p>
                במידה ונתקלתם בבעיית נגישות, נשמח מאוד אם תפנו אלינו כדי שנוכל
                לתקן ולשפר.
              </p>
              <p className="mt-2 font-medium">פיתוח על ידי נדב גלילי</p>
              <p className="mt-2 font-medium">nadavg1000@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute left-1/2 top-1/2 h-[512px] w-[60%] -translate-x-1/2 -translate-y-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary),transparent_50%)_10%,transparent_60%)]" />
      </div>
    </main>
  );
}
