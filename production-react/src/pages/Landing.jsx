import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import Logo from '../components/Logo'

export default function Landing() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo className="w-8 h-8" textClassName="text-lg" />
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Turn screen time into <span className="text-purple-600">quality time</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            A new interactive family activity every week. Create comics, stories, games, and art together. No skills required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <StarIcon className="w-6 h-6" />
              Start 7-Day Free Trial
            </Link>
            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              See All Games
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required • Cancel anytime
          </p>

          {/* Trust Badges */}
          <div className="mt-12 max-w-xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-gray-900">Safe, High-Quality Screen Time</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>No ads, ever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>No in-app purchases</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Parent controls built-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Ages 5-12 expert-designed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600">52</div>
              <div className="mt-2 text-gray-600">Games per year</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">15-30</div>
              <div className="mt-2 text-gray-600">Minutes per activity</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">1,200+</div>
              <div className="mt-2 text-gray-600">Families joined</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">This week's games</h2>
          <p className="mt-4 text-lg text-gray-600">Interactive activities your family will actually enjoy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Free Game */}
          <GameCard
            icon={<ClockIcon className="w-8 h-8" />}
            title="Presidential Time Machine"
            description="Bring a president to 2026 and see what would shock them"
            duration="20 min"
            difficulty="Easy"
            isFree={true}
          />

          {/* Premium Games */}
          <GameCard
            icon={<SparklesIcon className="w-8 h-8" />}
            title="Superhero Origin Story"
            description="Create a custom superhero based on your child's personality"
            duration="25 min"
            difficulty="Medium"
            isPremium={true}
          />

          <GameCard
            icon={<UserGroupIcon className="w-8 h-8" />}
            title="Family Character Quiz"
            description="Discover which Disney character matches each family member"
            duration="15 min"
            difficulty="Easy"
            isPremium={true}
          />

          <GameCard
            icon={<SparklesIcon className="w-8 h-8" />}
            title="Dream Treehouse Designer"
            description="Design the ultimate backyard treehouse with blueprints"
            duration="30 min"
            difficulty="Medium"
            isPremium={true}
          />

          <GameCard
            icon={<UserGroupIcon className="w-8 h-8" />}
            title="Restaurant Menu Maker"
            description="Create a menu for your imaginary restaurant"
            duration="20 min"
            difficulty="Easy"
            isPremium={true}
          />

          <GameCard
            icon={<SparklesIcon className="w-8 h-8" />}
            title="Video Game Designer"
            description="Design your own video game concept with characters and story"
            duration="35 min"
            difficulty="Hard"
            isPremium={true}
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-600">7-day free trial. Cancel anytime.</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual <span className="text-green-600 text-sm ml-1">(Save 50%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">$0</span>
              </div>
              <p className="mt-2 text-gray-600">Try 5 free games forever</p>

              <ul className="mt-8 space-y-4">
                <Feature text="5 free games" included />
                <Feature text="Print & save creations" included />
                <Feature text="Mobile friendly" included />
                <Feature text="Weekly new games" included={false} />
                <Feature text="Drawing gallery" included={false} />
                <Feature text="Multiple children profiles" included={false} />
              </ul>

              <Link
                to="/signup"
                className="mt-8 w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-purple-600 rounded-2xl p-8 relative bg-gradient-to-b from-purple-50 to-white">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">Premium</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">
                  {billingCycle === 'monthly' ? '$9.99' : '$59.99'}
                </span>
                <span className="ml-2 text-gray-600">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                {billingCycle === 'annual' && 'Just $5/month • '}
                New game every Sunday
              </p>

              <ul className="mt-8 space-y-4">
                <Feature text="52 games per year" included />
                <Feature text="All free games included" included />
                <Feature text="Save unlimited creations" included />
                <Feature text="Drawing gallery & sharing" included />
                <Feature text="Multiple children profiles" included />
                <Feature text="Early access to new games" included />
                <Feature text="Priority support" included />
              </ul>

              <Link
                to="/signup"
                className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <StarIcon className="w-5 h-5" />
                Start 7-Day Free Trial
              </Link>
              <p className="mt-3 text-sm text-center text-gray-500">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What families are saying</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Testimonial
            quote="We used to fight about screen time. Now Sunday night is 'Family Night' and my kids actually ask to put their phones away."
            author="Sarah M."
            role="Mom of two (ages 8 & 11)"
          />
          <Testimonial
            quote="The games are actually fun for adults too! We've made 12 comics together and hung them on the fridge. Best $10/month I spend."
            author="David K."
            role="Dad of three (ages 6, 9, 12)"
          />
          <Testimonial
            quote="My shy 7-year-old created an entire superhero universe. She's so proud of her drawings. This app brought out her creativity."
            author="Jennifer L."
            role="Mom of one (age 7)"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            <FAQ
              question="How does the free trial work?"
              answer="Sign up and get 7 days of Premium access with no credit card required. After the trial, you'll be downgraded to the free plan (5 games) unless you subscribe."
            />
            <FAQ
              question="What ages are the games designed for?"
              answer="Our games are designed for kids ages 6-14, but families with younger or older kids enjoy them too. Each game shows a difficulty level so you can choose what works for your family."
            />
            <FAQ
              question="Do I need any special skills or software?"
              answer="Nope! Everything works right in your web browser on any device (phone, tablet, computer). No apps to download, no accounts to create for your kids."
            />
            <FAQ
              question="Can I cancel anytime?"
              answer="Yes! Cancel your subscription at any time from your account settings. You'll keep Premium access until the end of your billing period, then automatically switch to the free plan."
            />
            <FAQ
              question="How often are new games released?"
              answer="Premium members get a brand new game every Sunday. Free members have permanent access to 5 games."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to reclaim family time?</h2>
          <p className="mt-4 text-xl text-purple-100">
            Join 1,200+ families creating memories instead of scrolling
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            <StarIcon className="w-6 h-6" />
            Start Your Free Trial
          </Link>
          <p className="mt-4 text-sm text-purple-200">
            7 days free • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <SparklesIcon className="w-6 h-6" />
                <span className="font-bold">AI Family Night</span>
              </div>
              <p className="text-sm">
                Turn screen time into quality time with weekly interactive family activities.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/games" className="hover:text-white">All Games</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            © 2026 AI Family Night. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Reusable Components
function GameCard({ icon, title, description, duration, difficulty, isFree, isPremium }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all relative">
      {isPremium && (
        <div className="absolute top-4 right-4">
          <LockClosedIcon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      {isFree && (
        <div className="absolute top-4 right-4">
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
            FREE
          </span>
        </div>
      )}

      <div className="text-purple-600 mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          {duration}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {difficulty}
        </span>
      </div>
    </div>
  )
}

function Feature({ text, included }) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <CheckCircleIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
      )}
      <span className={included ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
    </li>
  )
}

function Testimonial({ quote, author, role }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <p className="text-gray-700 italic">"{quote}"</p>
      <div className="mt-4">
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </div>
  )
}

function FAQ({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className="text-gray-400">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  )
}
