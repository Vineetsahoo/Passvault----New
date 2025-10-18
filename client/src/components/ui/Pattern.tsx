import React from 'react';
import styled from 'styled-components';

const Pattern = () => {
  return (
    <StyledWrapper>
      <div className="container" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    --color-0: #fff;
    --color-1: #6366f1;
    --color-2: #4f46e5;
    --color-3: #4338ca;
    --color-4: #3730a3;
    --color-5: #c7d2fe;
    --color-6: #8b5cf6;
    --color-7: #7c3aed;
    --color-8: #a78bfa;
    --color-9: #8b5cf6;
    width: 100%;
    height: 100%;
    background-color: var(--color-1);
    background-image: linear-gradient(
        to top,
        var(--color-2) 5%,
        var(--color-1) 6%,
        var(--color-1) 7%,
        transparent 7%
      ),
      linear-gradient(to bottom, var(--color-1) 30%, transparent 80%),
      linear-gradient(to right, var(--color-2), var(--color-4) 5%, transparent 5%),
      linear-gradient(
        to right,
        transparent 6%,
        var(--color-2) 6%,
        var(--color-4) 9%,
        transparent 9%
      ),
      linear-gradient(
        to right,
        transparent 27%,
        var(--color-2) 27%,
        var(--color-4) 34%,
        transparent 34%
      ),
      linear-gradient(
        to right,
        transparent 51%,
        var(--color-2) 51%,
        var(--color-4) 57%,
        transparent 57%
      ),
      linear-gradient(to bottom, var(--color-1) 35%, transparent 35%),
      linear-gradient(
        to right,
        transparent 42%,
        var(--color-2) 42%,
        var(--color-4) 44%,
        transparent 44%
      ),
      linear-gradient(
        to right,
        transparent 45%,
        var(--color-2) 45%,
        var(--color-4) 47%,
        transparent 47%
      ),
      linear-gradient(
        to right,
        transparent 48%,
        var(--color-2) 48%,
        var(--color-4) 50%,
        transparent 50%
      ),
      linear-gradient(
        to right,
        transparent 87%,
        var(--color-2) 87%,
        var(--color-4) 91%,
        transparent 91%
      ),
      linear-gradient(to bottom, var(--color-1) 37.5%, transparent 37.5%),
      linear-gradient(
        to right,
        transparent 14%,
        var(--color-2) 14%,
        var(--color-4) 20%,
        transparent 20%
      ),
      linear-gradient(to bottom, var(--color-1) 40%, transparent 40%),
      linear-gradient(
        to right,
        transparent 10%,
        var(--color-2) 10%,
        var(--color-4) 13%,
        transparent 13%
      ),
      linear-gradient(
        to right,
        transparent 21%,
        var(--color-2) 21%,
        var(--color-3) 25%,
        transparent 25%
      ),
      linear-gradient(
        to right,
        transparent 58%,
        var(--color-2) 58%,
        var(--color-4) 64%,
        transparent 64%
      ),
      linear-gradient(
        to right,
        transparent 92%,
        var(--color-2) 92%,
        var(--color-4) 95%,
        transparent 95%
      ),
      linear-gradient(to bottom, var(--color-1) 48%, transparent 48%),
      linear-gradient(
        to right,
        transparent 96%,
        var(--color-2) 96%,
        var(--color-3) 99%,
        transparent 99%
      ),
      linear-gradient(
        to bottom,
        transparent 68.5%,
        transparent 76%,
        var(--color-1) 76%,
        var(--color-1) 77.5%,
        transparent 77.5%,
        transparent 86%,
        var(--color-1) 86%,
        var(--color-1) 87.5%,
        transparent 87.5%
      ),
      linear-gradient(
        to right,
        transparent 35%,
        var(--color-2) 35%,
        var(--color-4) 41%,
        transparent 41%
      ),
      linear-gradient(to bottom, var(--color-1) 68%, transparent 68%),
      linear-gradient(
        to right,
        transparent 78%,
        var(--color-3) 78%,
        var(--color-3) 80%,
        transparent 80%,
        transparent 82%,
        var(--color-3) 82%,
        var(--color-3) 83%,
        transparent 83%
      ),
      linear-gradient(
        to right,
        transparent 66%,
        var(--color-2) 66%,
        var(--color-4) 85%,
        transparent 85%
      );
    background-size: 300px 150px;
    background-position: center bottom;
  }

  .container:before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    background-color: var(--color-1);
    background-image: linear-gradient(
        to top,
        var(--color-5) 5%,
        var(--color-1) 6%,
        var(--color-1) 7%,
        transparent 7%
      ),
      linear-gradient(to bottom, var(--color-1) 30%, transparent 30%),
      linear-gradient(to right, var(--color-6), var(--color-7) 5%, transparent 5%),
      linear-gradient(
        to right,
        transparent 6%,
        var(--color-8) 6%,
        var(--color-9) 9%,
        transparent 9%
      ),
      linear-gradient(
        to right,
        transparent 27%,
        #c084fc 27%,
        #a855f7 34%,
        transparent 34%
      ),
      linear-gradient(
        to right,
        transparent 51%,
        #a78bfa 51%,
        #8b5cf6 57%,
        transparent 57%
      ),
      linear-gradient(to bottom, var(--color-1) 35%, transparent 35%),
      linear-gradient(
        to right,
        transparent 42%,
        #7c3aed 42%,
        #6d28d9 44%,
        transparent 44%
      ),
      linear-gradient(
        to right,
        transparent 45%,
        #7c3aed 45%,
        #6d28d9 47%,
        transparent 47%
      ),
      linear-gradient(
        to right,
        transparent 48%,
        #7c3aed 48%,
        #6d28d9 50%,
        transparent 50%
      ),
      linear-gradient(
        to right,
        transparent 87%,
        #c4b5fd 87%,
        #a78bfa 91%,
        transparent 91%
      ),
      linear-gradient(to bottom, var(--color-1) 37.5%, transparent 37.5%),
      linear-gradient(
        to right,
        transparent 14%,
        #ddd6fe 14%,
        #c4b5fd 20%,
        transparent 20%
      ),
      linear-gradient(to bottom, var(--color-1) 40%, transparent 40%),
      linear-gradient(
        to right,
        transparent 10%,
        #8b5cf6 10%,
        #7c3aed 13%,
        transparent 13%
      ),
      linear-gradient(
        to right,
        transparent 21%,
        #a855f7 21%,
        #9333ea 25%,
        transparent 25%
      ),
      linear-gradient(
        to right,
        transparent 58%,
        #a855f7 58%,
        #9333ea 64%,
        transparent 64%
      ),
      linear-gradient(
        to right,
        transparent 92%,
        #6366f1 92%,
        #4f46e5 95%,
        transparent 95%
      ),
      linear-gradient(to bottom, var(--color-1) 48%, transparent 48%),
      linear-gradient(
        to right,
        transparent 96%,
        #6366f1 96%,
        #4f46e5 99%,
        transparent 99%
      ),
      linear-gradient(
        to bottom,
        transparent 68.5%,
        transparent 76%,
        var(--color-1) 76%,
        var(--color-1) 77.5%,
        transparent 77.5%,
        transparent 86%,
        var(--color-1) 86%,
        var(--color-1) 87.5%,
        transparent 87.5%
      ),
      linear-gradient(
        to right,
        transparent 35%,
        #a78bfa 35%,
        #8b5cf6 41%,
        transparent 41%
      ),
      linear-gradient(to bottom, var(--color-1) 68%, transparent 68%),
      linear-gradient(
        to right,
        transparent 78%,
        #c4b5fd 78%,
        #c4b5fd 80%,
        transparent 80%,
        transparent 82%,
        #c4b5fd 82%,
        #c4b5fd 83%,
        transparent 83%
      ),
      linear-gradient(
        to right,
        transparent 66%,
        #8b5cf6 66%,
        #7c3aed 85%,
        transparent 85%
      );
    background-size: 300px 150px;
    background-position: center bottom;
    clip-path: circle(150px at center center);
    animation: flashlight 20s ease infinite;
  }

  .container:after {
    content: "";
    width: 25px;
    height: 10px;
    position: absolute;
    left: calc(50% + 59px);
    bottom: 100px;
    background-repeat: no-repeat;
    background-image: radial-gradient(circle, #fff 50%, transparent 50%),
      radial-gradient(circle, #fff 50%, transparent 50%);
    background-size: 10px 10px;
    background-position:
      left center,
      right center;
    animation: eyes 20s infinite;
  }

  @keyframes flashlight {
    0% {
      clip-path: circle(150px at -25% 10%);
    }

    38% {
      clip-path: circle(150px at 60% 20%);
    }

    39% {
      opacity: 1;
      clip-path: circle(150px at 60% 86%);
    }

    40% {
      opacity: 0;
      clip-path: circle(150px at 60% 86%);
    }

    41% {
      opacity: 1;
      clip-path: circle(150px at 60% 86%);
    }

    42% {
      opacity: 0;
      clip-path: circle(150px at 60% 86%);
    }

    54% {
      opacity: 0;
      clip-path: circle(150px at 60% 86%);
    }

    55% {
      opacity: 1;
      clip-path: circle(150px at 60% 86%);
    }

    59% {
      opacity: 1;
      clip-path: circle(150px at 60% 86%);
    }

    64% {
      clip-path: circle(150px at 45% 78%);
    }

    68% {
      clip-path: circle(150px at 85% 89%);
    }

    72% {
      clip-path: circle(150px at 60% 86%);
    }

    74% {
      clip-path: circle(150px at 60% 86%);
    }

    100% {
      clip-path: circle(150px at 150% 50%);
    }
  }

  @keyframes eyes {
    0%,
    38% {
      opacity: 0;
    }

    39%,
    41% {
      opacity: 1;
      transform: scaleY(1);
    }

    40% {
      transform: scaleY(0);
      filter: none;
      background-image: radial-gradient(circle, #fff 50%, transparent 50%),
        radial-gradient(circle, #fff 50%, transparent 50%);
    }

    41% {
      transform: scaleY(1);
      background-image: radial-gradient(circle, #8b5cf6 50%, transparent 50%),
        radial-gradient(circle, #8b5cf6 50%, transparent 50%);
      filter: drop-shadow(0 0 4px #c4b5fd);
    }

    42%,
    100% {
      opacity: 0;
    }
  }
`;

export default Pattern;
