import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/layout/Nav";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-700">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Terms & Conditions
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                ATOZ Broking Client Portal
              </p>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-slate-600">
            Please read these terms before using the ATOZ Broking client
            portal. By accessing or using the portal, you agree to the
            applicable terms and policies.
          </p>

          <div className="space-y-6 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                1. Purpose of the Portal
              </h2>
              <p>
                The portal provides authorised users access to available
                account information, portfolio details, holdings, transactions,
                reports and notifications. Available features depend on the
                services enabled by the business.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                2. Account Security
              </h2>
              <p>
                Users must keep their login credentials confidential and must
                not share their accounts with unauthorised persons. Report
                suspected unauthorised access to the designated support team
                promptly.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                3. Information and Accuracy
              </h2>
              <p>
                Account information and reports should be checked against
                official records. The business operating this portal is
                responsible for verifying the accuracy, completeness and
                timeliness of information it provides.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                4. Investment Risk
              </h2>
              <p>
                Investments are subject to market risks. The portal itself
                does not guarantee returns or constitute investment advice
                merely by displaying account information. Users should review
                applicable product documents and seek authorised professional
                advice where appropriate.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                5. Acceptable Use
              </h2>
              <p>
                Users must not misuse the portal, attempt unauthorised access,
                interfere with its operation, upload malicious files or use
                another person's credentials.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                6. Availability and Support
              </h2>
              <p>
                The portal may occasionally be unavailable for maintenance,
                technical issues or circumstances beyond the operator's
                reasonable control. Questions and complaints should be
                directed to the business's designated support contact.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                7. Privacy
              </h2>
              <p>
                Personal and financial information must be handled according
                to the applicable privacy notice and relevant laws. Please
                consult the business for information about data collection,
                usage, retention and grievance procedures.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                8. Limitation of Responsibility
              </h2>
              <p>
                Nothing in these terms excludes or limits liability where
                such exclusion or limitation is prohibited by applicable law.
                Responsibilities of the portal operator and its service
                providers must be determined by the applicable agreements
                and laws.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                9. Changes to These Terms
              </h2>
              <p>
                The business operating the portal may update these terms when
                required. Updated terms should display their effective date,
                and users should review changes before continued use.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                10. Governing Law and Contact
              </h2>
              <p>
                These terms are subject to applicable laws of India. The
                business must publish its full legal name, registered address,
                effective date and appropriate support or grievance contact
                before using this document as its final legal terms.
              </p>
            </section>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
            Draft for review. The business owner should verify these terms
            with a qualified Indian lawyer before publishing them.
          </div>
        </article>

        <p className="mt-5 text-center text-xs text-slate-400">
          ATOZ Broking Client Portal
        </p>
      </div>
    </div>
  );
}
