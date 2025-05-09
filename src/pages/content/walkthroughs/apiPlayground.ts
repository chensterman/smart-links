import { 
  sequentialHighlights, 
  HighlightStep, 
  createClickStep, 
  createTypeTextStep,
  createHighlightByTextStep,
  createClickByTextStep,
  createScrollToStep,
  createScrollToTextStep
} from '../utils';

/**
 * Highlights buttons sequentially and performs actions to guide the user through the API key setup process
 */
export const apiPlayground = async (): Promise<void> => {  
  // Define the sequence of highlights and actions
  const steps: HighlightStep[] = [
    createHighlightByTextStep(
      'p',
      'API Playground',
      "To make it easier for you to test our API endpoints, we have a sandbox environment called the API Playground!",
      4000,
      false
    ),
    createClickByTextStep('p', 'API Playground', false),
    createHighlightByTextStep(
      'p',
      'Search',
      "The Search endpoint utilizes our search engine built specifically for AI agents (LLMs), delivering real-time, accurate, and factual results at speed.",
      8000,
      false
    ),
    createClickByTextStep('p', 'Extract', false),
    createHighlightByTextStep(
      'p',
      'Extract',
      "The Extract endpoint allows you to scrape web page content from one or more specified URLs.",
      8000,
      false
    ),
    createClickByTextStep('p', 'Crawl', false),
    createHighlightByTextStep(
      'p',
      'Crawl',
      "The Crawl endpoint allows you to traverse a site like a graph starting from a base URL. This is feature is currently in open-access beta!",
      8000,
      false
    ),
    createClickByTextStep('p', 'Search', false),
    createHighlightByTextStep(
      'p',
      'Search',
      "Let's go through an example with the Search endpoint!",
      5000,
      false
    ),
    {
      selector: ".chakra-select.css-4nt0n4",
      text: "Let's use the default API key...",
      duration: 3000
    },
    {
      selector: ".chakra-textarea.css-1bp0xr6",
      text: "...and search for something interesting...",
      duration: 3000
    },
    createTypeTextStep(".chakra-textarea.css-1bp0xr6", "What is the capital of France?", 50, true),
    createHighlightByTextStep(
      'p',
      'Additional fields',
      "Let's see what other parameters we can use!",
      3000,
      false
    ),
    createClickByTextStep('p', 'Additional fields', false),
    createHighlightByTextStep(
      'span',
      'Include images',
      "Let's include images in our search results!",
      3000,
      false
    ),
    createClickStep(".chakra-checkbox__input"),
    createScrollToStep('.chakra-button.css-1tci97j'),
    {
      selector: ".chakra-button.css-1tci97j",
      text: "Finally, we can execute the request!",
      duration: 5000
    },
    createClickStep('.chakra-button.css-1tci97j'),
    createScrollToTextStep('p', 'Response', false),
    createHighlightByTextStep(
      'p',
      'Response',
      "You can find the results here!",
      5000,
      false
    ),
  ];

  await sequentialHighlights(steps, 500);
};
