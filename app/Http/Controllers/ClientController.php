<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(){
        $search = request()->query('search');
        $client = Client::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->get();

        return Inertia::render('Clients/Index',[
            'client' => $client,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function create(){
        return Inertia::render('Clients/Create');
    }
    public function store(Request $request){
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients,email',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'type_client' => 'required|in:particulier,entreprise',
            'nif' => 'nullable|string|max:20',
            'stat' => 'nullable|string|max:20',
            'rcs_ville' => 'nullable|string|max:255',
        ]);

        Client::create($validated);
        return redirect()->route('clients.index')->with('success', 'Client created successfully.');
    }
    public function edit($id){
        $client = Client::findOrFail($id);
        return Inertia::render('Clients/Edit', [
            'client' => $client
        ]);
    }
    public function update(Request $request, $id){
        $client = Client::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients,email,' . $client->id_client . ',id_client',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'type_client' => 'required|in:particulier,entreprise',
            'nif' => 'nullable|string|max:20',
            'stat' => 'nullable|string|max:20',
            'rcs_ville' => 'nullable|string|max:255',
        ]);

        $client->update($validated);
        return redirect()->route('clients.index')->with('success', 'Client updated successfully.');
    }
     public function destroy($id){
        $client = Client::findOrFail($id);
        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Client deleted successfully.');
    }
}
