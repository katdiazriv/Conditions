import { useState } from 'react';
import { LoanProvider } from './contexts/LoanContext';
import { RoleProvider } from './contexts/RoleContext';
import { LoanHeaderBar } from './components/LoanHeaderBar';
import { LoanSelectorModal } from './components/LoanSelectorModal';
import { ConditionsPortal } from './components/ConditionsPortal';

function App() {
  const [showLoanSelector, setShowLoanSelector] = useState(false);

  return (
    <RoleProvider>
      <LoanProvider>
        <div className="min-h-screen flex flex-col">
          <LoanHeaderBar onOpenSelector={() => setShowLoanSelector(true)} />
          <div className="flex-1">
            <ConditionsPortal />
          </div>
        </div>

        {showLoanSelector && (
          <LoanSelectorModal onClose={() => setShowLoanSelector(false)} />
        )}
      </LoanProvider>
    </RoleProvider>
  );
}

export default App;
