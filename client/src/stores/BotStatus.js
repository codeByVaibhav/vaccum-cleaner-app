import React from 'react';
import { create } from 'zustand'

export const BotStatus = Object.freeze({
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    MODE: Object.freeze({
        ECO: 'ECO',
        POWER: 'POWER',
        MANUAL: 'MANUAL'
    }),
    CLEAN: 'CLEAN',
    MAINTENANCE: 'MAINTENANCE',
    SUPPORT: 'SUPPORT',
    POWER_ON_OFF: 'POWER_ON_OFF',
    PRESET: 'PRESET'
});

export const useVaccumCleanerStatus = create((set) => ({
    status: BotStatus.ONLINE,
    updateStatus: (status) => set((state) => {
        return {
            ...state, status
        }
    })
}))

export const useVaccumCleanerMode = create((set) => ({
    mode: BotStatus.MODE.ECO,
    updateMode: (mode) => set((state) => {
        return {
            ...state, mode
        }
    })
}))

export const useVaccumCleanerPower = create((set) => ({
    power: BotStatus.ONLINE,
    updatePower: (power) => set((state) => {
        return {
            ...state, power
        }
    })
}))
