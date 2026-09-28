import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "კონფიდენციალურობის პოლიტიკა",
  description:
    "გაეცანით, თუ როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს პერსონალურ მონაცემებს AI ჩატ-ასისტენტით სარგებლობისას.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* უკან დაბრუნების ბმული */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mb-6 transition-colors"
        >
          ← მთავარ გვერდზე დაბრუნება
        </Link>

        {/* სათაური */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          კონფიდენციალურობის პოლიტიკა და პასუხისმგებლობის უარყოფა
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          ბოლო განახლება: 28 სექტემბერი, 2026
        </p>

        <p className="mb-6 leading-relaxed">
          ჩვენთვის მნიშვნელოვანია თქვენი კონფიდენციალურობა და პერსონალური
          მონაცემების დაცვა. წინამდებარე დოკუმენტი განმარტავს, თუ როგორ ვაგროვებთ,
          ვიყენებთ და ვინახავთ თქვენს მონაცემებს ხელოვნური ინტელექტის (AI)
          ჩატ-ასისტენტით სარგებლობისას.
        </p>

        <div className="space-y-8">
          {/* სექცია 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. რა მონაცემებს ვაგროვებთ?
            </h2>
            <p className="mb-3">
              ჩატის გამოყენებისას შესაძლოა შეგროვდეს შემდეგი სახის ინფორმაცია:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">
                  შეტყობინებების ისტორია:
                </strong>{" "}
                ტექსტი, რომელსაც წერთ ჩატში AI ასისტენტთან კომუნიკაციისას.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">
                  ტექნიკური მეტამონაცემები:
                </strong>{" "}
                IP მისამართი, ბრაუზერის ტიპი, ენის პარამეტრები და სესიის
                ხანგრძლივობა.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">
                  საკონტაქტო ინფორმაცია:
                </strong>{" "}
                იმ შემთხვევაში, თუ მოითხოვთ ოპერატორთან გადამისამართებას ან
                მიუთითებთ ელ.ფოსტას/ტელეფონის ნომერს.
              </li>
            </ul>
          </section>

          {/* სექცია 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. როგორ გამოიყენება თქვენი მონაცემები?
            </h2>
            <p className="mb-3">შეგროვებული ინფორმაცია გამოიყენება ექსკლუზიურად:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>თქვენს შეკითხვებზე ზუსტი და ადეკვატური პასუხების გასაცემად.</li>
              <li>
                მომსახურების ხარისხის გაუმჯობესებისა და AI ასისტენტის ცოდნის
                ბაზის ხარვეზების აღმოსაფხვრელად.
              </li>
              <li>
                საჭიროების შემთხვევაში, მომხმარებელთა მხარდაჭერის გუნდთან (რეალურ
                ოპერატორთან) დასაკავშირებლად.
              </li>
            </ol>
          </section>

          {/* სექცია 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. მონაცემთა დამუშავება და მესამე მხარეები
            </h2>
            <p className="leading-relaxed mb-3">
              პასუხების გენერირებისთვის ჩვენ ვიყენებთ უსაფრთხო ღრუბლოვან
              ტექნოლოგიებსა და AI მოდელებს (Google Gemini API, Supabase).
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                თქვენი შეტყობინებები გადაეცემა AI მოდელს მხოლოდ პასუხის მომზადების
                მიზნით.
              </li>
              <li>
                ჩვენ <strong className="text-gray-900 dark:text-white">არ ვყიდით</strong> და არ გადავცემთ თქვენს პერსონალურ
                მონაცემებს მესამე პირებს მარკეტინგული მიზნებისთვის.
              </li>
            </ul>
          </section>

          {/* სექცია 4 */}
          <section className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-xl border border-amber-200 dark:border-amber-800/50">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-200 mb-3">
              4. პასუხისმგებლობის უარყოფა (AI Disclaimer)
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-amber-950 dark:text-amber-300">
              <li>
                <strong>ავტომატიზებული პასუხები:</strong> ჩატ-ასისტენტი მუშაობს
                ხელოვნური ინტელექტის ალგორითმებზე. მიუხედავად იმისა, რომ ჩვენ
                მაქსიმალურად ვცდილობთ ინფორმაციის სიზუსტის უზრუნველყოფას, AI-მ
                შესაძლოა გენერირება გაუკეთოს არაზუსტ ან მოძველებულ ინფორმაციას.
              </li>
              <li>
                <strong>არასამედიცინო / არასამართლებრივი კონსულტაცია:</strong> AI
                ასისტენტის მიერ გაცემული პასუხები ატარებს მხოლოდ საინფორმაციო
                ხასიათს და არ წარმოადგენს იურიდიულ, ფინანსურ ან სამედიცინო
                რჩევას.
              </li>
              <li>
                <strong>პასუხისმგებლობის შეზღუდვა:</strong> პლატფორმა არ იღებს
                პასუხისმგებლობას გადაწყვეტილებებზე ან ზიანზე, რომელიც გამოწვეულია
                AI ასისტენტის მიერ მოწოდებული ინფორმაციის გამოყენებით.
              </li>
            </ul>
          </section>

          {/* სექცია 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. მონაცემთა დაცვა და შენახვა
            </h2>
            <p className="leading-relaxed">
              ჩვენ ვიყენებთ თანამედროვე უსაფრთხოების სტანდარტებს (მათ შორის
              მონაცემთა შიფრაციას და წვდომის შეზღუდვის მექანიზმებს - RLS), რათა
              დავიცვათ თქვენი ინფორმაცია არასანქცირებული წვდომისგან.
            </p>
          </section>

          {/* სექცია 6 */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. კონტაქტი
            </h2>
            <p className="leading-relaxed">
              თუ გაქვთ შეკითხვები კონფიდენციალურობის პოლიტიკასთან დაკავშირებით ან
              გსურთ თქვენი მონაცემების წაშლა, დაგვიკავშირდით ელ.ფოსტაზე:{" "}
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