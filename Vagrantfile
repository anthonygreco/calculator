Vagrant.configure("2") do |config|

    config.vm.box = "precise32"
    config.vm.box_url = "http://files.vagrantup.com/precise32.box"

    config.vm.network :forwarded_port, host: 8080, guest: 80

    config.vm.provision "chef_solo" do |chef|

        chef.add_recipe "apt" 
        chef.add_recipe "apache2"

        chef.json = { 
            "apache" => {
                "default_site_enabled" => true,
                "docroot_dir" => "/vagrant"
            }
        }

    end

end