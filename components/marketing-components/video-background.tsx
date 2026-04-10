const VideoBackground = () => {
    return (
        <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
        >
            <source src="videos/heroVideo.mp4" type="video/mp4" />
        </video>
    )
}

export default VideoBackground