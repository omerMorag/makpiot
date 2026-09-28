"use client";

import { Wallet } from "lucide-react";
import { useCostEstimator } from "@/components/cost-estimator/useCostEstimator";
import WizardStepper from "@/components/cost-estimator/WizardStepper";
import CostEstimatorResultCard from "@/components/cost-estimator/CostEstimatorResultCard";
import SavedEstimatesList from "@/components/cost-estimator/SavedEstimatesList";
import WizardActions from "@/components/cost-estimator/WizardActions";
import DisclaimerNote from "@/components/shared/DisclaimerNote";
import HenIllustration from "@/components/hens/HenIllustration";
import Step1TreatmentTrack from "@/components/cost-estimator/steps/Step1TreatmentTrack";
import Step2HealthFund from "@/components/cost-estimator/steps/Step2HealthFund";
import Step3CycleCount from "@/components/cost-estimator/steps/Step3CycleCount";
import Step4DoctorAccompaniment from "@/components/cost-estimator/steps/Step4DoctorAccompaniment";
import Step5ClinicCost from "@/components/cost-estimator/steps/Step5ClinicCost";
import Step6Medication from "@/components/cost-estimator/steps/Step6Medication";
import Step7AdditionalCosts from "@/components/cost-estimator/steps/Step7AdditionalCosts";

const STEP_COMPONENTS = [
  Step1TreatmentTrack,
  Step2HealthFund,
  Step3CycleCount,
  Step4DoctorAccompaniment,
  Step5ClinicCost,
  Step6Medication,
  Step7AdditionalCosts,
] as const;

/**
 * "כמה יעלה לי?" — מחשבון עלות אישי בן 7 שלבים. עובד במלואו במצב אורחת
 * (localStorage, בדיוק כמו useJourneyProgress); שמירה בענן דורשת Google בלבד.
 * זהו כלי כספי בלבד — לא ממליץ על מינונים/תרופות ולא כלי רפואי.
 */
export default function CostEstimatorSection() {
  const estimator = useCostEstimator();
  const { step, totalSteps, goToStep, hasCalculated, calculate, answers, updateAnswer } = estimator;

  const StepComponent = STEP_COMPONENTS[step - 1];

  return (
    <div className="print-stack animate-fadeUp">
      <section className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            כמה התהליך עשוי לעלות לי?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">
            עני על כמה שאלות ונבנה לך הערכת עלות מסודרת. המחירים משתנים בין קופות, מרפאות
            ופרוטוקולים, לכן התוצאה היא הערכה בלבד.
          </p>
        </div>

        {/* התרנגולת עם המחשבון והארנק — במובייל אחרי הכותרת, בדסקטופ מהצד הנגדי */}
        <div className="no-print mt-4 flex justify-center lg:mt-0 lg:shrink-0 lg:justify-end">
          <HenIllustration name="costs" blob="mint" />
        </div>
      </section>

      <section className="mt-6 sm:mt-8">
        {!hasCalculated ? (
          <div className="no-print rounded-2xl border-2 border-mist-200 bg-white p-5 shadow-card sm:p-7">
            <WizardStepper
              step={step}
              totalSteps={totalSteps}
              onBack={() => goToStep(step - 1)}
              onNext={() => (step === totalSteps ? calculate() : goToStep(step + 1))}
              nextLabel={step === totalSteps ? "חשבי את העלות" : undefined}
            >
              <StepComponent answers={answers} updateAnswer={updateAnswer} />
            </WizardStepper>
          </div>
        ) : (
          <>
            <CostEstimatorResultCard result={estimator.result} priceLastUpdatedAt={estimator.priceLastUpdatedAt} />
            <WizardActions estimator={estimator} />
            <SavedEstimatesList />
          </>
        )}
      </section>

      <section className="mt-8">
        <DisclaimerNote icon={Wallet}>
          <p>אין להמליץ על מינונים או על תרופות מסוימות. המחשבון הוא כלי כספי בלבד ולא כלי רפואי.</p>
        </DisclaimerNote>
      </section>
    </div>
  );
}
