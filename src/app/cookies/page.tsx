import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie პოლიტიკა",
  description:
    "შეიტყვეთ მეტი იმის შესახებ, თუ როგორ ვიყენებთ ქუქი-ფაილებსა და LocalStorage-ს საიტზე თქვენი გამოცდილების გაუმჯობესებისთვის.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        
        <Link
          href="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mb-6 transition-colors"
        >
          ← მთავარ გვერდზე დაბრუნება
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cookie (ქუქი-ფაილების) პოლიტიკა
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          ბოლო განახლება: 28 სექტემბერი, 2026
        </p>

        <p className="mb-6 leading-relaxed">
          ეს პოლიტიკა განმარტავს, თუ როგორ ვიყენებთ ქუქი-ფაილებს (Cookies) და
          ლოკალურ მეხსიერებას (LocalStorage) ჩვენს საიტზე თქვენი გამოცდილების
          გაუმჯობესების მიზნით.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. რა არის ქუქი-ფაილი (Cookie)?
            </h2>
            <p className="leading-relaxed">
              ქუქი-ფაილი არის მცირე ზომის ტექსტური მონაცემი, რომელიც ინახება თქვენს
              მოწყობილობაზე (კომპიუტერში ან ტელეფონში) ვებ-გვერდის სტუმრობისას.
              ის ეხმარება საიტს დაიმახსოვროს თქვენი პარამეტრები და სესია.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. რაში ვიყენებთ ქუქი-ფაილებსა და LocalStorage-ს?
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">
                  ჩატის სესიის შენარჩუნება (Visitor ID):
                </strong>{" "}
                ჩვენ ვიყენებთ `localStorage`-ს უნიკალური ვიზიტორის ID-ის
                შესანახად, რათა ჩატმა დაიმახსოვროს თქვენი საუბრის ისტორია
                გვერდის გადატვირთვისას.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">
                  აუცილებელი ტექნიკური ფაილები:
                </strong>{" "}
                საიტის გამართული და უსაფრთხო მუშაობისთვის.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. ქუქი-ფაილების მართვა
            </h2>
            <p className="leading-relaxed">
              თქვენ შეგიძლიათ ნებისმიერ დროს წაშალოთ ან დაბლოკოთ ქუქი-ფაილები
              თქვენი ბრაუზერის პარამეტრებიდან (Settings → Privacy & Security).
              გაითვალისწინეთ, რომ ქუქიების გათიშვისას შესაძლოა ჩატის ისტორიამ
              ხელახლა გადაიტვირთოს.
            </p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. კონტაქტი
            </h2>
            <p className="leading-relaxed">
              დამატებითი შეკითხვებისთვის მოგვწერეთ:{" "}
              <a
                href="mailto:yourbot95@gmail.com"
                className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-500"
              >
                yourbot95@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}