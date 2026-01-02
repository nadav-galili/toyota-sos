'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border shadow-sm w-full space-y-6 animate-appear opacity-0 [animation-delay:200ms]">
          <h1 className="text-3xl font-bold text-foreground border-b pb-4">
            מדיניות פרטיות לעובדים ונהגים - Toyota S.O.S
          </h1>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground">
              מדיניות זו מפרטת את אופן איסוף המידע, השימוש בו והגנתו במערכת
              Toyota S.O.S, בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981 (כולל
              תיקון 13) והתקנות הרלוונטיות לשנת 2026.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground pt-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                1. המידע שאנו אוספים
              </h2>
              <p>המערכת אוספת מידע הכרחי לצורך ניהול העבודה והמשימות:</p>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>
                  <span className="font-bold text-foreground">פרטי זיהוי:</span>{' '}
                  שם מלא, מספר תעודת זהות, פרטי רישיון נהיגה.
                </li>
                <li>
                  <span className="font-bold text-foreground">פרטי קשר:</span>{' '}
                  מספר טלפון וכתובת דואר אלקטרוני.
                </li>
                <li>
                  <span className="font-bold text-foreground">
                    נתוני מיקום (GPS):
                  </span>{' '}
                  המערכת אוספת נתוני מיקום בזמן אמת בעת ביצוע משימות ושינוע
                  רכבים.
                </li>
                <li>
                  <span className="font-bold text-foreground">
                    נתוני עבודה:
                  </span>{' '}
                  זמני כניסה ויציאה (Check-in/Out), סטטוס משימות, היסטוריית
                  נסיעות.
                </li>
                <li>
                  <span className="font-bold text-foreground">
                    נתוני מכשיר:
                  </span>{' '}
                  סוג דפדפן, מערכת הפעלה וכתובת IP לצורך אבטחת מידע ותקינות
                  המערכת.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground pt-4">
                2. מטרות איסוף המידע
              </h2>
              <p>המידע נאסף ומשמש למטרות הבאות:</p>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>ניהול והקצאת משימות לנהגים בזמן אמת.</li>
                <li>
                  מעקב אחר מיקום רכבי החברה לצורכי לוגיסטיקה, ביטחון ובטיחות.
                </li>
                <li>תיעוד ביצוע משימות והפקת דוחות עבודה.</li>
                <li>שיפור ביצועי המערכת וייעול תהליכי העבודה בטויוטה חדרה.</li>
                <li>עמידה בדרישות חוקיות ורגולטוריות.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground pt-4">
                3. העברת מידע לצדדים שלישיים
              </h2>
              <p>המידע אינו נמכר לצדדים שלישיים. גישה למידע ניתנת רק ל:</p>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>הנהלת טויוטה חדרה (אדמינים ומנהלים מורשים).</li>
                <li>
                  ספקי שירותי ענן ותשתית (כגון Supabase) המאובטחים לפי תקנים
                  בינלאומיים.
                </li>
                <li>
                  שירותי אנליטיקה (כגון Mixpanel) לצורך שיפור חווית המשתמש (מידע
                  אנונימי ככל הניתן).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground pt-4">
                4. אבטחת מידע ושמירתו
              </h2>
              <p>
                אנו מיישמים אמצעי אבטחה טכנולוגיים וארגוניים מתקדמים להגנה על
                המידע מפני גישה בלתי מורשית. המידע יישמר למשך התקופה הנדרשת
                לצורך מימוש מטרות העבודה ועל פי דרישות הדין.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground pt-4">
                5. זכויותיכם
              </h2>
              <p>
                בהתאם לחוק, הנכם זכאים לעיין במידע שנאסף עליכם, לבקש לתקנו או
                למחוק אותו במידה והוא אינו מדויק או שאינו נדרש עוד למטרות שלשמן
                נאסף (בכפוף למגבלות חוקיות ותפעוליות של יחסי עבודה).
              </p>
            </section>

            <div className="pt-6 border-t mt-8">
              <p>
                לשאלות נוספות בנושא פרטיות, ניתן לפנות לממונה הגנת הפרטיות
                במייל:
              </p>
              <p className="mt-2 font-medium">yossi@toyota-sos.co.il</p>
              <p className="mt-4 text-xs">עודכן לאחרונה: ינואר 2026</p>
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
