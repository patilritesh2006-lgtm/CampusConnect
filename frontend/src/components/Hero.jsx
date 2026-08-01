function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center">

      <div className="flex-1">
        <h1 className="text-6xl font-bold leading-tight">
          Your Campus.
          <br />
          Your Events.
          <br />
          <span className="text-blue-600">
            Your Community.
          </span>
        </h1>

        <p className="mt-8 text-xl text-gray-600">
          Discover, register and participate in amazing
          college events with CampusConnect.
        </p>

        <button className="mt-10 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg">
          Explore Events
        </button>
      </div>

      <div className="flex-1 mt-10 md:mt-0">
        <img
          src="https://placehold.co/600x450"
          alt="Campus"
          className="rounded-3xl shadow-xl"
        />
      </div>

    </section>
  );
}

export default Hero;