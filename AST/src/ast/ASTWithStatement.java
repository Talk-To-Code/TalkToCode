package ast;

import java.util.ArrayList;
/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of AST node construction of with statements in Python Programs
 */
public class ASTWithStatement extends ASTBlockStatement {
	private static final String NODE_TYPE = "With";
	private ArrayList<ASTExpressionUnit> withItems;
	private ArrayList<String> name;
	private ArrayList<ASTStatement> statements;
	
	public ASTWithStatement() {
		super();
		this.statements = new ArrayList<ASTStatement>();
		this.withItems = new ArrayList<ASTExpressionUnit>();
		this.name = new ArrayList<String>();
	}
	
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	
	public void addWithItem(ASTExpressionUnit withItems) {
		this.withItems.add(withItems);
		this.name.add("");
		withItems.addParent(this);
	}
	
	public void addName(String name) {
		this.name.set(this.name.size()-1, name);
	}
	
	public String toSyntax(){
		this.result = "with ";
		for(int i = 0; i < this.withItems.size(); i++) {
			this.result += this.withItems.get(i).toSyntax();
			if(this.name.get(i).compareTo("") != 0) this.result += " as " + this.name.get(i);
			if(i < this.withItems.size()-1) this.result += ", ";
		}
		this.result += ":\n";
		for (ASTStatement s : this.statements) {
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "\t";
			this.result += s.toSyntax();
			this.result += "\n";
		}
		return this.result;
	}
	
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for(ASTStatement s:this.statements){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}

}
