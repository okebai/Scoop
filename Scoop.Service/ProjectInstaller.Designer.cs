﻿namespace Scoop.Service
{
    partial class ProjectInstaller
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.ScoopServiceProcessInstaller = new System.ServiceProcess.ServiceProcessInstaller();
            this.ScoopServiceInstaller = new System.ServiceProcess.ServiceInstaller();
            // 
            // ScoopServiceProcessInstaller
            // 
            this.ScoopServiceProcessInstaller.Account = System.ServiceProcess.ServiceAccount.LocalSystem;
            this.ScoopServiceProcessInstaller.Password = null;
            this.ScoopServiceProcessInstaller.Username = null;
            // 
            // ScoopServiceInstaller
            // 
            this.ScoopServiceInstaller.DisplayName = "Scoop Service";
            this.ScoopServiceInstaller.ServiceName = "ScoopService";
            this.ScoopServiceInstaller.StartType = System.ServiceProcess.ServiceStartMode.Automatic;
            // 
            // ProjectInstaller
            // 
            this.Installers.AddRange(new System.Configuration.Install.Installer[] {
            this.ScoopServiceProcessInstaller,
            this.ScoopServiceInstaller});

        }

        #endregion

        private System.ServiceProcess.ServiceProcessInstaller ScoopServiceProcessInstaller;
        private System.ServiceProcess.ServiceInstaller ScoopServiceInstaller;
    }
}