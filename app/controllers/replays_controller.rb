class ReplaysController < ApplicationController
  # GET /replays
  def index
    @replays = Replay.all
    render
  end

  # GET /replays/1
  def show
    @replay = Replay.find(params[:id])

    if @replay.dataPath == ''
	flash[:notice] = "no dataPath associated with replay"
	redirect_to :back
	return
    end

    begin
	    @replaydata = File.read(@replay.dataPath)
    rescue
	    flash[:notice] = "invalid dataPath associated with replay"
	    redirect_to :back
	    return
    end

    # able to retreve the appData file, so render the view
    render :layout => "appWithMap"

    # can alter the layout based on the user. see rails layouts
    # search for current_user
    #
  end

  # GET /replays/new
  def new
    @replay = Replay.new
    begin
	    @replaydata = File.read('public/appdata/replay_empty.json')
    rescue
	    flash[:notice] = "invalid dataPath associated with replay"
	    redirect_to :back
	    return
    end
    render "edit", :layout => "appWithMap"
  end

  # GET /replays/1/edit
  def edit
    @replay = Replay.find(params[:id])
    if @replay.dataPath == ''
	flash[:notice] = "no dataPath associated with replay"
	redirect_to :back
	return
    end

    begin
	    @replaydata = File.read(@replay.dataPath)
    rescue
	    flash[:notice] = "invalid dataPath associated with replay"
	    redirect_to :back
	    return
    end
    render :layout => "appWithMap"
  end

  # POST /replays
  # POST /replays.json
  def create
    @replay = Replay.new(params[:replay])

    respond_to do |format|
      if @replay.save
        format.html { redirect_to @replay, notice: 'Replay was successfully created.' }
        format.json { render json: @replay, status: :created, location: @replay }
      else
        format.html { render action: "new" }
        format.json { render json: @replay.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /replays/1
  # PUT /replays/1.json
  def update #upsert
    @replay = Replay.find(params[:id])

    respond_to do |format|
      if @replay.update_attributes(params[:replay])
        format.html { redirect_to @replay, notice: 'Replay was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @replay.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /replays/1
  # DELETE /replays/1.json
  def destroy
    @replay = Replay.find(params[:id])
    @replay.destroy

    respond_to do |format|
      format.html { redirect_to replays_url }
      format.json { head :no_content }
    end
  end

  # GET /replays/1/appData
  # returns JSON data
  def appdata
    @replay = Replay.find(params[:id])

    if @replay.dataPath != ''
	    begin
		    render :file => @replay.dataPath
	    rescue
		    render :inline => "{error: 'unable to open dataPath'}"
	    end
    else
	    render :inline => "{error: 'no dataPath'}"
    end
  end
end
