import os
import json

def build_country_data(directory):
    countries = []
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            country_name = filename.split('.')[0]
            flag_path = os.path.join(directory, filename)
            countries.append({'name': country_name, 'flag': "./"+flag_path})
    return countries

def main():
    directory = 'img/flag'  # Directory where flag images are stored
    countries_data = build_country_data(directory)

    # Print the result or write it to a file
    print(json.dumps(countries_data, indent=4))
    with open('countryFlags.js', 'w') as f:
        f.write('const countries = ')
        json.dump(countries_data, f, indent=4)

if __name__ == "__main__":
    main()
