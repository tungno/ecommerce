import React from 'react';
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122) </div>
        </div>
        <div className="descriptionbox-description">
            <p>An e-commerce website is an online platform that facilitate....</p>
            <p>
                In the quiet hush of dawn, when the world still clings to the remnants
                of dreams, there lies a profound stillness that speaks volumes.
                It's a moment untouched by the chaos of the day, where the air feels
                fresher and the sky holds a gentle promise of possibilities.
                The early light paints everything in soft hues, casting a serene
                glow that whispers of new beginnings and untold stories. In this
                tranquil pause, there is a chance to breathe deeply, to reflect,
                and to embrace the subtle beauty that often goes unnoticed.
                It's in these fleeting moments of peace that one can find a clarity,
                a gentle nudge to follow one's heart and pursue the path that feels
                truest.
            </p>
        </div>
    </div>
  );
};

export default DescriptionBox;
