package ast;

import java.util.ArrayList;
/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of generation of syntax that represents a try catch in 
 * python programs
 *
 */
public class ASTTryCatchStatementP extends ASTTryCatchStatement {
	private ArrayList<ASTStatement> elseBlock;
	
	public ASTTryCatchStatementP() {
		super();
		this.elseBlock = new ArrayList<ASTStatement>();
	}
	
	public void addElseBlock(ASTStatement s) {
		this.elseBlock.add(s);
		s.addParent(this);
	}
	
	//actual code generation
	public String toSyntax() {
		this.result = "try:\n";
		for(int i = 0;i<this.tryBlock.size();i++){
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "\t";
			this.result += this.tryBlock.get(i).toSyntax();
			if(this.tryBlock.get(i) instanceof ASTSimpleStatement || this.tryBlock.get(i) instanceof ASTComment) this.result += "\n";
		}
		for(int i = 0; i <= this.numCatchBlocks; i++) {
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "except";
			if(this.catchExceptions.get(i).size() > 0) {
				this.result += "(";
				for(int j = 0; j < this.catchExceptions.get(i).size(); j++) {
					this.result += this.catchExceptions.get(i).get(j).toSyntax();
					if(j < this.catchExceptions.get(i).size()-1) this.result += ", ";
				}
				this.result += ")";
				if(this.ex.get(i).toSyntax().compareTo("") != 0) this.result += " as " + this.ex.get(i).toSyntax();
			}
			this.result += ":\n";
			
			for(ASTStatement s : this.catchBlocks.get(i)) {
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += s.toSyntax();
				if(s instanceof ASTSimpleStatement || s instanceof ASTComment) this.result += "\n";
			}
		}
		if(!this.elseBlock.isEmpty()){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result+="else:\n";
			for(int i = 0;i<this.elseBlock.size();i++){
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += this.elseBlock.get(i).toSyntax();
				if(this.elseBlock.get(i) instanceof ASTSimpleStatement || this.elseBlock.get(i) instanceof ASTComment) this.result += "\n";
			}
		}
		if(!this.finallyBlock.isEmpty()){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result+="finally:\n";
			for(int i = 0;i<this.finallyBlock.size();i++){
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += this.finallyBlock.get(i).toSyntax();
				if(this.finallyBlock.get(i) instanceof ASTSimpleStatement || this.finallyBlock.get(i) instanceof ASTComment) this.result += "\n";
			}
		}
		return this.result;
	}
	
	public String toTree(int indent) {
		StringBuilder sb = new StringBuilder("");
		for (int i = 0; i < indent; i++) {
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for (ASTStatement s : this.tryBlock) {
			sb.append(s.toTree(indent + 1));
			sb.append("\n");
		}
		for (int j = 0; j <= this.numCatchBlocks; j++) {
			for (int k = 0; k < indent; k++) {
				sb.append("\t");
			}
			sb.append("catch_block");
			sb.append("\n");
			for (ASTStatement s : this.catchBlocks.get(j)) {
				sb.append(s.toTree(indent + 1));
				sb.append("\n");
			}

		}
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append("else_block");
		sb.append("\n");
		for(ASTStatement s:this.elseBlock){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append("finally_block");
		sb.append("\n");
		for(ASTStatement s:this.finallyBlock){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
