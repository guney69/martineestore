import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getRandomInt } from '../utils/random';

interface Experiment {
    id: string;
    variant: 'control' | 'variant_a' | 'variant_b';
}

interface ExperimentContextType {
    experiments: Experiment[];
    getVariant: (experimentId: string) => string;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mock experiments
    const [experiments] = useState<Experiment[]>([
        { id: 'checkout_flow_v2', variant: getRandomInt(0, 1) === 0 ? 'control' : 'variant_a' },
        { id: 'home_banner_click', variant: getRandomInt(0, 2) === 0 ? 'control' : (getRandomInt(0, 1) === 0 ? 'variant_a' : 'variant_b') }
    ]);

    const getVariant = (experimentId: string) => {
        const exp = experiments.find(e => e.id === experimentId);
        return exp ? exp.variant : 'control';
    };

    return (
        <ExperimentContext.Provider value={{ experiments, getVariant }}>
            {children}
        </ExperimentContext.Provider>
    );
};

export const useExperiment = () => {
    const context = useContext(ExperimentContext);
    if (!context) throw new Error("useExperiment must be used within ExperimentProvider");
    return context;
};
