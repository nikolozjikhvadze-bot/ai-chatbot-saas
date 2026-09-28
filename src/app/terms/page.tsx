import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "მოხმარების პირობები",
  description:
    "წაიკითხეთ ჩვენი პლატფორმითა და AI ასისტენტის სერვისით სარგებლობის წესები, პირობები და პასუხისმგებლობის შეზღუდვები.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
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
          მოხმარების პირობები (Terms of Service)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          ბოლო განახლება: 28 სექტემბერი, 2026
        </p>

        <p className="mb-6 leading-relaxed">
          გთხოვთ, ყურადღებით წაიკითხოთ წინამდებარე მოხმარების პირობები ჩვენი
          პლატფორმითა და AI ასისტენტის სერვისით სარგებლობამდე.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. მომსახურების მიღება და პირობებზე თანხმობა
            </h2>
            <p className="leading-relaxed">
              საიტით ან AI ჩატის სერვისით სარგებლობით თქვენ ადასტურებთ, რომ
              ეცნობით და ეთანხმებით ამ მოხმარების პირობებს. თუ არ ეთანხმებით აღნიშნულ
              წესებს, გთხოვთ შეწყვიტოთ სერვისით სარგებლობა.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. სერვისის გამოყენების წესები
            </h2>
            <p className="mb-3">სერვისით სარგებლობისას აკრძალულია:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>სისტემისთვის არალეგალური, შეურაცხმყოფელი ან მავნე შინაარსის გაგზავნა.</li>
              <li>
                AI ასისტენტის მოტყუების ან მისი უსაფრთხოების ბარიერების
                გვერდის ავლის მცდელობა (Prompt Injection / Jailbreak).
              </li>
              <li>
                სერვისზე ავტომატიზებული შეტევების, სპამის ან გადაჭარბებული
                მოთხოვნების გაგზავნა (Rate Limiting-ის დარღვევა).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. ინტელექტუალური საკუთრება
            </h2>
            <p className="leading-relaxed">
              პლატფორმის დიზაინი, კოდი, ლოგოტიპი და ცოდნის ბაზა წარმოადგენს ჩვენს
              ინტელექტუალურ საკუთრებას. მომხმარებლის მიერ ჩატში შეყვანილი ტექსტი
              რჩება მომხმარებლის საკუთრებაში.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. პასუხისმგებლობის შეზღუდვა
            </h2>
            <p className="leading-relaxed">
              სერვისი მოწოდებულია "როგორც არის" (As-Is) პრინციპით. ჩვენ არ ვართ
              პასუხისმგებელი AI ასისტენტის მიერ გენერირებულ არაზუსტ პასუხებზე ან
              სერვისის დროებით ტექნიკურ შეფერხებაზე.
            </p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. კონტაქტი
            </h2>
            <p className="leading-relaxed">
              შეკითხვების შემთხვევაში დაგვიკავშირდით:{" "}
              <a
                href="mailto:support@yourdomain.com"
                className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-500"
              >
                support@yourdomain.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}