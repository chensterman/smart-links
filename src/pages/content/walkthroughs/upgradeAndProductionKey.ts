import { 
  sequentialHighlights, 
  HighlightStep, 
  createClickStep, 
  createHighlightByTextStep,
  createClickByTextStep 
} from '../utils';

/**
 * Highlights buttons sequentially and performs actions to guide the user through the API key setup process
 */
export const upgradeAndProductionKey = async (): Promise<void> => {  
  // Define the sequence of highlights and actions
  const steps: HighlightStep[] = [
    {
      selector: ".chakra-button.css-gaydkc",
      text: "If you want to add a new API key, you can do this here!",
      duration: 4000
    },
    createClickStep(".chakra-button.css-gaydkc"),
    {
      selector: ".chakra-radio__label.css-14iyyou",
      text: "However, if you want to create a production key with a rate limit of 1000 requests per minute (as compared to 100 using a development key), you must be on an active paid plan, or have the PAYGO option enabled.",
      duration: 7000
    },
    createClickStep(".chakra-button.css-1ux6ti9"),
    createHighlightByTextStep(
      'p',
      'Billing',
      "To upgrade your plan, you can visit the billing page.",
      4000,
      false
    ),
    createClickByTextStep('p', 'Billing', false),
    {
      selector: ".chakra-heading.css-edjpho",
      text: "For example, let us activate PAYGO by clicking the switch below.",
      duration: 4000
    },
    createClickStep(".chakra-switch.css-xqg94v"),
    {
      selector: ".chakra-button.css-g6s2cd",
      text: "On the next page, we can enter our payment information to activate PAYGO.",
      duration: 4000
    },
    createClickStep(".chakra-button.css-g6s2cd")
  ];

  await sequentialHighlights(steps, 500);
};
