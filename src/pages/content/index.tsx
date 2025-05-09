import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import './style.css' 
import { upgradeAndProductionKey } from './walkthroughs/upgradeAndProductionKey';
import { apiPlayground } from './walkthroughs/apiPlayground';

const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);

// Check if the URL contains the smartlink query parameter with value 4276
const urlParams = new URLSearchParams(window.location.search);
const smartLinkId = urlParams.get('smartlink');

// Component to render in the extension root
const SmartLink = () => {
  useEffect(() => {
    if (smartLinkId === '4276') {
      // Wait a short time for the page to fully load before starting the walkthrough
      setTimeout(async () => {
        try {
          await upgradeAndProductionKey();
          console.log('Walkthrough completed successfully');
        } catch (error) {
          console.error('Error during walkthrough:', error);
        }
      }, 500);
    } else if (smartLinkId === '2743') {
      // Wait a short time for the page to fully load before starting the walkthrough
      setTimeout(async () => {
        try {
          await apiPlayground();
          console.log('Walkthrough completed successfully');
        } catch (error) {
          console.error('Error during walkthrough:', error);
        }
      }, 500);
    }
  }, []);
  
  return (
    <div className='absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50'>
      {smartLinkId ? (
        <span className='font-bold'>Smart Links Active</span>
      ) : (
        <>content script <span className='your-class'>loaded</span></>
      )}
    </div>
  );
};

root.render(<SmartLink />);

try {
  console.log('Content script loaded.');
  if (smartLinkId) {
    console.log(`Smart link detected: smartlink=${smartLinkId}`);
  }
} catch (e) {
  console.error(e);
}
