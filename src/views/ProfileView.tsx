import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Download, Trash2, Globe } from 'lucide-react';
import { exportData, exportCSV } from '@/lib/store';

const ProfileView = () => {
  const { state, t, language, setLanguage, updateProfile, resetData } = useApp();
  const { profile } = state;

  const handleExportJSON = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomiabspro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const data = exportCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomiabspro-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const levels = [
    { key: 'sedentary', label: t.profile.sedentary },
    { key: 'active', label: t.profile.active },
    { key: 'advanced', label: t.profile.advanced },
  ] as const;

  const rhythms = [
    { key: 'slow', label: t.profile.slow },
    { key: 'normal', label: t.profile.normal },
    { key: 'aggressive', label: t.profile.aggressive },
  ] as const;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t.profile.title}</h1>
      <p className="text-muted-foreground mb-6">
        {language === 'es' ? 'Personalización real' : 'Real personalization'}
      </p>

      {/* Language Toggle */}
      <div className="card-brutal p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Idioma / Language</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage('es')}
              className={cn(
                'px-3 py-1 text-sm font-bold uppercase tracking-wider border-2 transition-colors',
                language === 'es'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground'
              )}
            >
              ES
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'px-3 py-1 text-sm font-bold uppercase tracking-wider border-2 transition-colors',
                language === 'en'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground'
              )}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Level */}
      <div className="card-brutal p-4 mb-4">
        <div className="terminal-text mb-3">{t.profile.level}</div>
        <div className="flex gap-2">
          {levels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateProfile({ level: key })}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-2 transition-colors duration-150',
                profile.level === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="card-brutal p-4 mb-4">
        <div className="terminal-text mb-3">{t.profile.preferences}</div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>{t.profile.noJumps}</span>
            <Switch
              checked={profile.preferences.noJumps}
              onCheckedChange={(checked) =>
                updateProfile({ preferences: { ...profile.preferences, noJumps: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{t.profile.noFloor}</span>
            <Switch
              checked={profile.preferences.noFloor}
              onCheckedChange={(checked) =>
                updateProfile({ preferences: { ...profile.preferences, noFloor: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{t.profile.noEquipment}</span>
            <Switch
              checked={profile.preferences.noEquipment}
              onCheckedChange={(checked) =>
                updateProfile({ preferences: { ...profile.preferences, noEquipment: checked } })
              }
            />
          </div>
        </div>
      </div>

      {/* Rhythm */}
      <div className="card-brutal p-4 mb-4">
        <div className="terminal-text mb-3">{t.profile.rhythm}</div>
        <div className="flex gap-2">
          {rhythms.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateProfile({ rhythm: key })}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-2 transition-colors duration-150',
                profile.rhythm === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Silent Mode */}
      <div className="card-brutal p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{t.profile.silentMode}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'es' ? 'Solo métricas, sin mensajes' : 'Metrics only, no messages'}
            </div>
          </div>
          <Switch
            checked={profile.silentMode}
            onCheckedChange={(checked) => updateProfile({ silentMode: checked })}
          />
        </div>
      </div>

      {/* Daily Time */}
      <div className="card-brutal p-4 mb-6">
        <div className="terminal-text mb-3">{t.profile.dailyTime}</div>
        <div className="flex gap-2">
          {[5, 10, 15, 20, 30].map((mins) => (
            <button
              key={mins}
              onClick={() => updateProfile({ dailyTimeMinutes: mins })}
              className={cn(
                'flex-1 py-2 font-mono text-sm border-2 transition-colors duration-150',
                profile.dailyTimeMinutes === mins
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              )}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Export & Data */}
      <div className="space-y-3">
        <Button
          onClick={handleExportJSON}
          variant="outline"
          className="w-full justify-start gap-2 border-2"
        >
          <Download className="w-4 h-4" />
          {language === 'es' ? 'Exportar JSON' : 'Export JSON'}
        </Button>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="w-full justify-start gap-2 border-2"
        >
          <Download className="w-4 h-4" />
          {language === 'es' ? 'Exportar CSV' : 'Export CSV'}
        </Button>
        <Button
          onClick={() => {
            if (confirm(language === 'es' ? '¿Borrar todos los datos?' : 'Delete all data?')) {
              resetData();
            }
          }}
          variant="outline"
          className="w-full justify-start gap-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-4 h-4" />
          {language === 'es' ? 'Borrar datos' : 'Delete data'}
        </Button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-secondary border-2 border-border">
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">🔒 100% Offline</strong>
          <br />
          {language === 'es'
            ? 'Todos los datos se guardan localmente. Sin cuentas. Sin tracking.'
            : 'All data stored locally. No accounts. No tracking.'}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
