'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, Users, Building2, DollarSign, FileText, Plus, Edit, Trash2, CheckCircle, ArrowLeft } from 'lucide-react'

interface Company {
  id: string
  name: string
  address: string
  taxNumber: string
  taxiLicenseNumber: string
  contactPerson: string
  email: string
  phone: string
  status: 'active' | 'pending' | 'suspended'
}

interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
  taxiLicenseNumber: string
  insuranceExpiry: string
  keuringExpiry: string
  status: 'active' | 'maintenance' | 'inactive'
}

interface Driver {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  taxiDriverLicense: string
  licenseExpiry: string
  vehicleId: string
  status: 'active' | 'inactive'
}

interface Tariff {
  id: string
  name: string
  code: string
  type: 'meter_based' | 'fixed_based'
  startPrice: number
  pricePerKm: number
  pricePerMinute: number
  nightSurcharge: number
  isActive: boolean
}

export default function DriversPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'company' | 'vehicles' | 'drivers' | 'tariffs'>('dashboard')
  const [companies, setCompanies] = useState<Company[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [tariffs, setTariffs] = useState<Tariff[]>([])

  // Form states
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showDriverForm, setShowDriverForm] = useState(false)
  const [showTariffForm, setShowTariffForm] = useState(false)

  const [companyForm, setCompanyForm] = useState({
    name: '',
    address: '',
    taxNumber: '',
    taxiLicenseNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    bankAccount: ''
  })

  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    taxiLicenseNumber: '',
    insuranceExpiry: '',
    keuringExpiry: ''
  })

  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    taxiDriverLicense: '',
    licenseExpiry: '',
    vehicleId: ''
  })

  const [tariffForm, setTariffForm] = useState({
    name: '',
    code: '',
    type: 'meter_based' as const,
    startPrice: 0,
    pricePerKm: 0,
    pricePerMinute: 0,
    nightSurcharge: 0
  })

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCompany: Company = {
      id: Date.now().toString(),
      ...companyForm,
      status: 'pending'
    }
    setCompanies([...companies, newCompany])
    setCompanyForm({
      name: '',
      address: '',
      taxNumber: '',
      taxiLicenseNumber: '',
      contactPerson: '',
      email: '',
      phone: '',
      bankAccount: ''
    })
    setShowCompanyForm(false)
  }

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      ...vehicleForm,
      status: 'active'
    }
    setVehicles([...vehicles, newVehicle])
    setVehicleForm({
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      taxiLicenseNumber: '',
      insuranceExpiry: '',
      keuringExpiry: ''
    })
    setShowVehicleForm(false)
  }

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newDriver: Driver = {
      id: Date.now().toString(),
      ...driverForm,
      status: 'active'
    }
    setDrivers([...drivers, newDriver])
    setDriverForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      taxiDriverLicense: '',
      licenseExpiry: '',
      vehicleId: ''
    })
    setShowDriverForm(false)
  }

  const handleTariffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTariff: Tariff = {
      id: Date.now().toString(),
      ...tariffForm,
      isActive: true
    }
    setTariffs([...tariffs, newTariff])
    setTariffForm({
      name: '',
      code: '',
      type: 'meter_based',
      startPrice: 0,
      pricePerKm: 0,
      pricePerMinute: 0,
      nightSurcharge: 0
    })
    setShowTariffForm(false)
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-600 p-3 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-600 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tariffs</p>
              <p className="text-2xl font-bold text-gray-900">{tariffs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => setCurrentView('company')}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <Building2 className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Company</h3>
          <p className="text-sm text-gray-600">Register and manage your taxi company details</p>
        </button>

        <button
          onClick={() => setCurrentView('vehicles')}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <Car className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Vehicles</h3>
          <p className="text-sm text-gray-600">Add and manage your fleet of taxi vehicles</p>
        </button>

        <button
          onClick={() => setCurrentView('drivers')}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <Users className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Drivers</h3>
          <p className="text-sm text-gray-600">Register and manage your taxi drivers</p>
        </button>

        <button
          onClick={() => setCurrentView('tariffs')}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <DollarSign className="h-8 w-8 text-orange-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Tariffs</h3>
          <p className="text-sm text-gray-600">Set up pricing and tariff structures</p>
        </button>
      </div>

      {/* Getting Started */}
      <div className="bg-blue-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Register Your Company</h3>
              <p className="text-gray-600 text-sm">Start by registering your taxi company with all required documentation.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Vehicles & Drivers</h3>
              <p className="text-gray-600 text-sm">Register your vehicles and drivers with proper licenses and documentation.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Configure Tariffs</h3>
              <p className="text-gray-600 text-sm">Set up your pricing structure and connect your taxi meter app.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCompanyManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
          <p className="text-gray-600">Manage your taxi company details and registration</p>
        </div>
        <button
          onClick={() => setShowCompanyForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Company
        </button>
      </div>

      {/* Company Form */}
      {showCompanyForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Register New Company</h3>
          <form onSubmit={handleCompanySubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Number</label>
              <input
                type="text"
                required
                value={companyForm.taxNumber}
                onChange={(e) => setCompanyForm({...companyForm, taxNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                required
                value={companyForm.address}
                onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxi License Number</label>
              <input
                type="text"
                required
                value={companyForm.taxiLicenseNumber}
                onChange={(e) => setCompanyForm({...companyForm, taxiLicenseNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
              <input
                type="text"
                required
                value={companyForm.contactPerson}
                onChange={(e) => setCompanyForm({...companyForm, contactPerson: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={companyForm.email}
                onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                required
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowCompanyForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Company
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Companies List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Companies</h3>
          {companies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No companies registered yet</p>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{company.name}</h4>
                      <p className="text-sm text-gray-600">{company.address}</p>
                      <p className="text-sm text-gray-600">Tax: {company.taxNumber} | License: {company.taxiLicenseNumber}</p>
                      <p className="text-sm text-gray-600">{company.contactPerson} | {company.email} | {company.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        company.status === 'active' ? 'bg-green-100 text-green-800' :
                        company.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {company.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">TaxiPlatform</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/riders" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Riders
              </Link>
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            {currentView !== 'dashboard' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentView === 'dashboard' && 'Driver Dashboard'}
                {currentView === 'company' && 'Company Management'}
                {currentView === 'vehicles' && 'Vehicle Management'}
                {currentView === 'drivers' && 'Driver Management'}
                {currentView === 'tariffs' && 'Tariff Management'}
              </h1>
              <p className="text-gray-600 mt-2">
                {currentView === 'dashboard' && 'Manage your taxi company, vehicles, drivers, and tariffs'}
                {currentView === 'company' && 'Register and manage your taxi company details'}
                {currentView === 'vehicles' && 'Add and manage your fleet of vehicles'}
                {currentView === 'drivers' && 'Register and manage your drivers'}
                {currentView === 'tariffs' && 'Configure pricing and tariff structures'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'company' && renderCompanyManagement()}
        {/* TODO: Add other views (vehicles, drivers, tariffs) */}
      </main>
    </div>
  )
} 