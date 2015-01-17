using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;

namespace Scoop.Service
{
    [RunInstaller(true)]
    public partial class ProjectInstaller : Installer
    {
        public ProjectInstaller()
        {
            InitializeComponent();
        }

        protected override void OnBeforeInstall(IDictionary savedState)
        {
            Context.Parameters["assemblypath"] = string.Format(@"""{0}"" ""{1}""", Context.Parameters["assemblypath"], ScoopService.Name);

            base.OnBeforeInstall(savedState);
        }
    }
}
