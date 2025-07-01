import React, { useEffect, useRef, useState } from 'react';
import './DroneShow.css';

const letterShapes = {
    e: [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
    ],
    l: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
    ],
    i: [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
    ],
    a: [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
    ],
    n: [
        [0, 0], [4, 0],
        [0, 1], [1, 1], [4, 1],
        [0, 2], [2, 2], [4, 2],
        [0, 3], [3, 3], [4, 3],
        [0, 4], [4, 4],
    ],
};

const DroneShow = ({ numberOfDrones = 150, formInterval = 10000, formDuration = 3000 }) => {
    const containerRef = useRef(null);
    const droneRefs = useRef([]);
    const [drones, setDrones] = useState([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const newDrones = [];
        for (let i = 0; i < numberOfDrones; i++) {
            const size = Math.random() * 5 + 3; // Drones between 3px and 8px
            newDrones.push({
                id: i,
                size: size,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
            });
        }
        setDrones(newDrones);

        console.log(`Total drones created: ${numberOfDrones}`);

        // Initial random positioning
        droneRefs.current.forEach((droneEl) => {
            if (droneEl) {
                droneEl.style.transform = `translate(${Math.random() * window.innerWidth}px, ${Math.random() * window.innerHeight}px)`;
            }
        });

        const formWord = () => {
            console.log("formWord triggered!");
            const word = "eliana";
            let currentDroneIndex = 0;
            const letterSpacing = 10; // Pixels between letters
            const letterScale = 10; // Scale factor for letter shapes
            let offsetX = (window.innerWidth - (word.length * 5 * letterScale + (word.length - 1) * letterSpacing)) / 2;
            const offsetY = (window.innerHeight - (5 * letterScale)) / 2;

            word.split('').forEach(char => {
                const shape = letterShapes[char];
                if (shape) {
                    shape.forEach(point => {
                        if (droneRefs.current[currentDroneIndex]) {
                            const targetX = offsetX + point[0] * letterScale;
                            const targetY = offsetY + point[1] * letterScale;
                            droneRefs.current[currentDroneIndex].style.transform = `translate(${targetX}px, ${targetY}px)`;
                            if (currentDroneIndex < 5) { // Log for first few drones
                                console.log(`Drone ${currentDroneIndex}: targetX=${targetX}, targetY=${targetY}, transform=${droneRefs.current[currentDroneIndex].style.transform}`);
                            }
                        }
                        currentDroneIndex++;
                    });
                }
                offsetX += (5 * letterScale) + letterSpacing; // Move offset for next letter
            });

            // For remaining drones, send them to random positions
            for (let i = currentDroneIndex; i < numberOfDrones; i++) {
                if (droneRefs.current[i]) {
                    droneRefs.current[i].style.transform = `translate(${Math.random() * window.innerWidth}px, ${Math.random() * window.innerHeight}px)`;
                }
            }

            setTimeout(() => {
                // After forming, send all drones back to random positions
                droneRefs.current.forEach((droneEl) => {
                    if (droneEl) {
                        droneEl.style.transform = `translate(${Math.random() * window.innerWidth}px, ${Math.random() * window.innerHeight}px)`;
                    }
                });
            }, formDuration);
        };

        const intervalId = setInterval(formWord, formInterval);

        return () => clearInterval(intervalId);
    }, [numberOfDrones, formInterval, formDuration]);

    return (
        <div ref={containerRef} className="drone-show-container">
            {drones.map((drone, index) => (
                <div
                    key={drone.id}
                    ref={el => droneRefs.current[index] = el}
                    className="drone"
                    style={{
                        width: `${drone.size}px`,
                        height: `${drone.size}px`,
                        left: drone.x,
                        top: drone.y,
                    }}
                ></div>
            ))}
        </div>
    );
};

export default DroneShow;
