
import chessvideo from "/assets/videos/chess.mp4";

export default function SampleVideo({ texty }) {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Video */}
      <video
        className="w-full h-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        src={chessvideo}
        type="video/mp4"
      >
        Your browser does not support the video tag.
      </video>

      {/* Black overlay to dim the video */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 text-white flex justify-center items-center">
        <div className=" flex justify-center items-center text-7xl font-bold w-150">

        {texty}
        </div>
      </div>
    </div>
  );
}
