import { Heart, Award, Users, ShoppingBag } from 'lucide-react';
import "./About.css";

const About = () => {
  const stats = [
    { icon: <Users size={40} />, number: "10K+", label: "Happy Customers" },
    { icon: <ShoppingBag size={40} />, number: "5K+", label: "Products Sold" },
    { icon: <Award size={40} />, number: "50+", label: "Awards Won" },
    { icon: <Heart size={40} />, number: "99%", label: "Satisfaction Rate" }
  ];

  const team = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://i.pravatar.cc/300?img=1",
      description: "Visionary leader with 15 years of fashion industry experience."
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Creative Director",
      image: "https://i.pravatar.cc/300?img=13",
      description: "Award-winning designer passionate about sustainable fashion."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "https://i.pravatar.cc/300?img=5",
      description: "Expert in supply chain management and quality control."
    }
  ];

  const values = [
    {
      icon: <Heart size={32} />,
      title: "Quality First",
      description: "We never compromise on the quality of our products. Every item is carefully selected and tested."
    },
    {
      icon: <Users size={32} />,
      title: "Customer Focused",
      description: "Your satisfaction is our priority. We listen, we care, and we deliver exceptional service."
    },
    {
      icon: <Award size={32} />,
      title: "Sustainability",
      description: "We're committed to eco-friendly practices and ethical sourcing to protect our planet."
    },
    {
      icon: <ShoppingBag size={32} />,
      title: "Innovation",
      description: "We constantly evolve and bring you the latest trends and cutting-edge designs."
    }
  ];

  return (
    <div className="aboutPage">

      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">Our Story</h1>
          <p className="about-hero-subtitle">
            Building a fashion brand that inspires confidence and celebrates individuality
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="about-section">
        <div className="about-container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title-left">Who We Are</h2>
              <p className="about-description">
                Founded in 2015, we started with a simple mission: to make high-quality, 
                stylish fashion accessible to everyone. What began as a small boutique has 
                grown into a beloved brand serving thousands of customers worldwide.
              </p>
              <p className="about-description">
                We believe that fashion is more than just clothing—it's a form of 
                self-expression, confidence, and creativity. Every piece we create is 
                designed with care, crafted with quality materials, and inspired by the 
                diverse lifestyles of our community.
              </p>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" 
                alt="Our Store" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="about-section">
        <div className="about-container">
          <h2 className="section-title-center">Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="about-section team-section">
        <div className="about-container">
          <h2 className="section-title-center">Meet Our Team</h2>
          <p className="team-subtitle">
            Passionate individuals working together to bring you the best fashion experience
          </p>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta">
        <div className="about-container">
          <h2 className="cta-title">Join Our Journey</h2>
          <p className="cta-description">
            Be part of our story and discover fashion that celebrates you
          </p>
          <button className="cta-button">Shop Now</button>
        </div>
      </div>

    </div>
  );
};

export default About;