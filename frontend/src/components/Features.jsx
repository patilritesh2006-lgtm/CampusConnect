import { Calendar, Bell, UserCheck } from "lucide-react";

function Features() {
  const features = [
    {
      icon: <Calendar size={40} className="text-blue-600" />,
      title: "College Events",
      description: "Browse and register for upcoming college events easily.",
    },
    {
      icon: <Bell size={40} className="text-blue-600" />,
      title: "Notifications",
      description: "Receive instant updates about new events and announcements.",
    },
    {
      icon: <UserCheck size={40} className="text-blue-600" />,
      title: "Easy Registration",
      description: "Register for events with just one click.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose CampusConnect?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>

              <h3 className="text-2xl font-semibold mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;