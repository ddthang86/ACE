const MaxAccuracy = 0.00001

function Agents(SLA, ServiceTime, CallsPerHour, AHT) {

     let BirthRate, DeathRate, TrafficRate
     let Erlangs, Utilisation, C, SLQueued
     let NoAgents, MaxIterate, Count
     let Server

     try {
          if (SLA > 1) SLA = 1

          BirthRate = CallsPerHour
          DeathRate = 3600 / AHT

          TrafficRate = BirthRate / DeathRate

          Erlangs = Math.trunc((BirthRate * (AHT)) / 3600 + 0.5)

          if (Erlangs < 1) NoAgents = 1;
          else NoAgents = Math.floor(Erlangs);

          Utilisation = TrafficRate / NoAgents

          while (Utilisation >= 1) {
               NoAgents = NoAgents + 1
               Utilisation = TrafficRate / NoAgents
          }

          MaxIterate = NoAgents * 100

          for (let index = 1;index <= MaxIterate;index++) {
               Utilisation = TrafficRate / NoAgents
               if (Utilisation < 1) {
                    Server = NoAgents
                    C = ErlangC(Server, TrafficRate)

                    SLQueued = 1 - C * Math.exp((TrafficRate - Server) * ServiceTime / AHT)
                    if (SLQueued < 0) SLQueued = 0
                    if (SLQueued >= SLA) Count = MaxIterate

                    if (SLQueued > (1 - MaxAccuracy)) Count = MaxIterate
               }
               if (Count != MaxIterate) NoAgents = NoAgents + 1

          }

     } catch (error) {
          console.log(error)
          NoAgents = 0

     }

     return NoAgents
}

function ErlangC(Servers, Intensity) {

     let B, C;
     try {
          if ((Servers < 0) || (Intensity < 0)) {
               return 0;
          }
          B = ErlangB(Servers, Intensity)
          C = B / (((Intensity / Servers) * B) + (1 - (Intensity / Servers)))
     } catch (error) {
          console.log(error)
          C = 0
     }

     return MinMax(C, 0, 1)
}

function ErlangB(Servers, Intensity) {

     let Val, Last, B;
     let MaxIterate;

     try {
          if ((Servers < 0) || (Intensity < 0)) {
               return 0
          }

          MaxIterate = Math.trunc(Servers)
          Val = Intensity
          Last = 1
          for (let Count = 1;Count <= MaxIterate;Count++) {
               B = (Val * Last) / (Count + (Val * Last))
               Last = B
          }
     } catch (error) {
          console.log(error)
          B = 0
     }

     return MinMax(B, 0, 1);
}

function MinMax(val , _min , _max ) {
    let result = val
    if (val < _min ) result = _min;
    if (val > _max ) result = _max;
    return result
}


(function () {
     let a = Agents(0.7,30,286,505)
     console.log(a);
})();
