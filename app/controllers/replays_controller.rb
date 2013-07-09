class ReplaysController < ApplicationController
  # --------------------------------------------------------------
  # HOME PAGE
  #     GET /replays
  #
  def index
    @replays = Replay.where('statusId>0')
    render
  end

  # --------------------------------------------------------------
  # SHOW
  #    GET /replays/1
  # regular view of replay
  #
  def show

    begin
	    @replay = Replay.find(params[:id])
    rescue
	    flash[:error] = "sorry, no such replay"
	    redirect_to :root
	    return
    end


    # make sure this user can see this replay
    if (@replay.statusId == "0") and (@replay.userId!=current_user.id)
	flash[:notice] = "sorry, can't show you specified replay"
	redirect_to :back
	return
    end

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
  end

  # --------------------------------------------------------------
  # NEW
  #
  #     GET /replays/new
  # 
  # This is called when the "New Replay" link in the header is clicked
  #
  def new
    @replay = Replay.new
    begin
        @path=Rails.root.to_s+"/public/appdata/replay_empty.json"
        logger.info "try to read #{@path}"
	    @replaydata = File.read("#{@path}")
    rescue
	    flash[:notice] = "cannot find blank replay JSON file"
	    redirect_to :back
	    return
    end
    render "edit", :layout => "appWithMap"
  end

  # --------------------------------------------------------------
  # EDIT
  #
  #     GET /replays/1/edit
  #
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

  # --------------------------------------------------------------
  # CREATE
  #
  #     POST /replays
  #
  # Called by edit view when there's no app ID
  #
  def create
	@replay = Replay.new()
	@data=request.filtered_parameters
	@replay.name=@data['appName']
	@replay.desc=@data['appDescription']
	@replay.source=@data['sources']
	@replay.attribution=@data['author']
	@replay.userId=current_user.id
	@replay.length=@data['animLength']
	@replay.screenshotPath=''
	@replay.dataPath=''
	@replay.statusId=@data['status']=="1" ? 1 : 0
	logger.debug "request: #{request}"
	logger.debug "data: #{@data}"

    respond_to do |format|   # should be a JSON request
      if @replay.save
	@filePath='/appdata/replay_'+@replay.id.to_s()+'.json'
	@replay.dataPath='public'+@filePath
	@data['dataPath']=@replay.dataPath
	@data['id']=@replay.id
	@jsondata=@data.to_json(:except => ['controller','replay', 'action'])
	logger.debug "data: "+@jsondata
	begin  # try to create the appdata file
	   logger.debug "trying to write file: "+Rails.public_path+@filePath
	   File.open(Rails.public_path+@filePath, 'w') {|f| f.write(@jsondata) }
   	   Replay.update(@replay.id,"dataPath"=>@replay.dataPath) # update DB with filename
	rescue
	   format.html { redirect_to @replay, notice: 'unable to write appdata json.' }
	   format.json { render json: @replay, status: 'unable to write appdata json.' }
	end
	# create and write succeeded
        format.html { redirect_to @replay, notice: 'Replay was successfully created.' }
        format.json { render json: @replay, status: :created, location: @replay }
      else # create failed
        format.html { render action: "new" }
        format.json { render json: @replay.errors, status: :unprocessable_entity }
      end
    end
  end

  # --------------------------------------------------------------
  # UPDATE
  #
  #    PUT /replays/1
  #
  # hit from edit view when ID is non-zero
  #
  def update
    	@replay = Replay.find(params[:id])
	@data=request.filtered_parameters
	logger.debug "data: #{@data}"

	if @replay.userId!=current_user.id  # only let right user update replay
	   render json: @replay, status: 'not permitted'
	end

    respond_to do |format|   # should be a JSON request
      if Replay.update(@replay.id, :name=>@data['appName'],
			:desc=>@data['appDescription'],
			:source=>@data['sources'],
			:attribution=>@data['author'],
			:length=>@data['animLength'],
			:statusId=>@data['status']=="1" ? 1 : 0)
	@filePath='/appdata/replay_'+@replay.id.to_s()+'.json' # dropping off the /public part
	@data['dataPath']=@replay.dataPath # make sure user doesn't screw it up
	@jsondata=@data.to_json(:except => ['controller','replay', 'action', 'updated_at', 'userId'])
	logger.debug "data to save: "+@jsondata
	begin  # try to create the appdata file
	   logger.debug "trying to write file: "+Rails.public_path+@filePath
	   File.open(Rails.public_path+@filePath, 'w') {|f| f.write(@jsondata) }
	rescue
	   format.html { redirect_to @replay, notice: 'unable to write appdata json.' }
	   format.json { render json: @replay, status: 'unable to write appdata json.' }
	end
	# create and write succeeded
        format.html { redirect_to @replay, notice: 'Replay was successfully created.' }
        format.json { render json: @replay, status: :created, location: @replay }
      else # create failed
        format.html { render action: "new" }
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
