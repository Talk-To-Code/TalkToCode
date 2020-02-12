package ast;
/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of generation of syntax that represents a try catch in 
 * Java programs
 *
 */
public class ASTTryCatchStatementJ extends ASTTryCatchStatement {
	
	public ASTTryCatchStatementJ() {
		super();
	}
	
	//actual code generation
	public String toSyntax() {
		this.result = "try {\n";
		for(int i = 0;i<this.tryBlock.size();i++){
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "\t";
			this.result += this.tryBlock.get(i).toSyntax();
			this.result += "\n";
		}
		this.result += "}\n";
		for(int i = 0; i <= this.numCatchBlocks; i++) {
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "catch (";
			for(int j = 0; j < this.catchExceptions.get(i).size(); j++) {
				this.result += this.catchExceptions.get(i).get(j).toSyntax();
				if(j < this.catchExceptions.get(i).size()-1) this.result += " | ";
			}
			if(this.catchExceptions.size() == 0) this.result += "Exception";
			this.result += " ";
			if(this.ex.get(i).toSyntax().compareTo("") != 0) this.result += this.ex.get(i).toSyntax();
			else this.result += "ex";
			this.result += ") {\n";
			
			for(ASTStatement s : this.catchBlocks.get(i)) {
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += s.toSyntax();
				this.result += "\n";
			}
			this.result += "}\n";
		}
		if(!this.finallyBlock.isEmpty()){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result+="finally {\n";
			for(int i = 0;i<this.finallyBlock.size();i++){
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += this.finallyBlock.get(i).toSyntax();
				this.result += "\n";
			}
			this.result += "}\n";
		}
		return this.result;
	}
}
