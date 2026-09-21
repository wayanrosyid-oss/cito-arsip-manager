import React from 'react';

interface ExpeditionTruckLoaderProps {
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ExpeditionTruckLoader: React.FC<ExpeditionTruckLoaderProps> = ({
  label = 'Memuat Data Ekspedisi...',
  sublabel = 'Armada Cito Adventure sedang bergerak',
  size = 'md',
}) => {
  const scaleClass =
    size === 'sm'
      ? 'scale-75'
      : size === 'lg'
      ? 'scale-110'
      : 'scale-90 sm:scale-100';

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center select-none">
      <div className={`expedition-loader-root ${scaleClass}`}>
        <div className="truckWrapper">
          {/* Truck Body */}
          <div className="truckBody">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 198 93"
              className="w-full h-auto"
            >
              {/* Cabin Cab */}
              <path
                strokeWidth="3"
                stroke="#15380e"
                fill="#275d1d"
                d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
              />
              {/* Window */}
              <path
                strokeWidth="3"
                stroke="#15380e"
                fill="#e2e8f0"
                d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
              />
              {/* Door handle */}
              <path
                strokeWidth="2"
                stroke="#15380e"
                fill="#15380e"
                d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
              />
              {/* Headlight (Gold) */}
              <rect
                strokeWidth="2"
                stroke="#15380e"
                fill="#e5a93c"
                rx="1"
                height="7"
                width="5"
                y="63"
                x="187"
              />
              {/* Bumper */}
              <rect
                strokeWidth="2"
                stroke="#15380e"
                fill="#15380e"
                rx="1"
                height="11"
                width="4"
                y="81"
                x="193"
              />
              {/* Cargo Box */}
              <rect
                strokeWidth="3"
                stroke="#15380e"
                fill="#f1f5f9"
                rx="2.5"
                height="90"
                width="121"
                y="1.5"
                x="6.5"
              />
              {/* Cito Badge Text on Cargo */}
              <text
                x="67"
                y="52"
                textAnchor="middle"
                fontSize="13"
                fontWeight="900"
                fill="#275d1d"
                fontFamily="Montserrat, sans-serif"
                letterSpacing="1"
              >
                CITO
              </text>
              {/* Tail bumper */}
              <rect
                strokeWidth="2"
                stroke="#15380e"
                fill="#15380e"
                rx="2"
                height="4"
                width="6"
                y="84"
                x="1"
              />
            </svg>
          </div>

          {/* Truck Tires */}
          <div className="truckTires">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 30 30"
              className="w-6 h-6"
            >
              <circle
                strokeWidth="3"
                stroke="#0f172a"
                fill="#1e293b"
                r="13.5"
                cy="15"
                cx="15"
              />
              <circle fill="#cbd5e1" r="6" cy="15" cx="15" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 30 30"
              className="w-6 h-6"
            >
              <circle
                strokeWidth="3"
                stroke="#0f172a"
                fill="#1e293b"
                r="13.5"
                cy="15"
                cx="15"
              />
              <circle fill="#cbd5e1" r="6" cy="15" cx="15" />
            </svg>
          </div>

          {/* Moving Road */}
          <div className="road" />

          {/* Street Lamp Animation */}
          <svg
            viewBox="0 0 453.459 453.459"
            xmlns="http://www.w3.org/2000/svg"
            fill="#275d1d"
            className="lampPost"
          >
            <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z" />
          </svg>
        </div>
      </div>

      <style>{`
        .expedition-loader-root {
          width: fit-content;
          height: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .truckWrapper {
          width: 200px;
          height: 100px;
          display: flex;
          flex-direction: column;
          position: relative;
          align-items: center;
          justify-content: flex-end;
          overflow-x: hidden;
        }
        .truckBody {
          width: 130px;
          height: auto;
          margin-bottom: 6px;
          animation: motion 1s linear infinite;
        }
        .truckTires {
          width: 130px;
          height: fit-content;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px 0 15px;
          position: absolute;
          bottom: 0;
        }
        .truckTires svg {
          animation: spin 0.5s linear infinite;
        }
        .road {
          width: 100%;
          height: 2px;
          background-color: #334155;
          position: relative;
          bottom: 0;
          align-self: flex-end;
          border-radius: 3px;
        }
        .road::before {
          content: "";
          position: absolute;
          width: 20px;
          height: 100%;
          background-color: #334155;
          right: -50%;
          border-radius: 3px;
          animation: roadAnimation 1.4s linear infinite;
          border-left: 10px solid white;
        }
        .road::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 100%;
          background-color: #334155;
          right: -65%;
          border-radius: 3px;
          animation: roadAnimation 1.4s linear infinite;
          border-left: 4px solid white;
        }
        .lampPost {
          position: absolute;
          bottom: 0;
          right: -90%;
          height: 90px;
          animation: roadAnimation 1.4s linear infinite;
        }
        @keyframes motion {
          0% { transform: translateY(0px); }
          50% { transform: translateY(2px); }
          100% { transform: translateY(0px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes roadAnimation {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-350px); }
        }
      `}</style>

      {label && (
        <p className="mt-3 text-xs sm:text-sm font-semibold text-stone-800 tracking-tight">
          {label}
        </p>
      )}
      {sublabel && (
        <p className="text-xs text-stone-500 max-w-xs mt-0.5 leading-snug">
          {sublabel}
        </p>
      )}
    </div>
  );
};
