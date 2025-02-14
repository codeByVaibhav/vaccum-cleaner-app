import React from "react";
import { MdPowerSettingsNew, MdEco, MdFlashOn, MdSettings, MdOutlineCleaningServices, MdBuild, MdSupportAgent, MdTune } from "react-icons/md";
import { BotStatus, useVaccumCleanerStatus, useVaccumCleanerMode, useVaccumCleanerPower } from "../stores/BotStatus";

const RemoteController = () => {
  const status = useVaccumCleanerStatus((state) => state.status);
  const updateVaccumStatus = useVaccumCleanerStatus((state) => state.updateStatus);

  const mode = useVaccumCleanerMode((state) => state.mode);
  const updateMode = useVaccumCleanerMode((state) => state.updateMode);

  const power = useVaccumCleanerPower((state) => state.power);
  const updatePower = useVaccumCleanerPower((state) => state.updatePower);

  return (
    <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl w-100">
      <button className="btn btn-circle btn-error btn-outline">
        <MdPowerSettingsNew size={21} />
      </button>

      <div className="flex flex-col items-center space-y-6">
        {/* Mode Section */}
        <div className="w-full flex flex-col items-center">
          <span className="text-xl text-white font-semibold mb-2">Mode</span>
          <div className="btn-group d-flex">
            <button className="btn btn-sm d-flex btn-success" onClick={() => updateMode(BotStatus.MODE.ECO)}>
              <MdEco className="mr-1" />
              Eco
            </button>
            <button className="btn btn-sm d-flex btn-error" onClick={() => updateMode(BotStatus.MODE.POWER)}>
              <MdFlashOn />
              Power
            </button>
            <button className="btn btn-sm d-flex btn-info" onClick={() => updateMode(BotStatus.MODE.MANUAL)}>
              <MdSettings />
              Manual
            </button>
          </div>
        </div>

        {/* Other remote buttons */}
        <button className="btn btn-wide btn-info">
          <MdOutlineCleaningServices className="mr-2" /> Clean
        </button>
        <button className="btn btn-wide btn-warning">
          <MdBuild className="mr-2" /> Maintenance
        </button>
        <button className="btn btn-wide btn-secondary">
          <MdSupportAgent className="mr-2" /> Support
        </button>
        <button className="btn btn-wide btn-success">
          <MdTune className="mr-2" /> Preset
        </button>
      </div>
    </div>
  );
};

export default RemoteController;
